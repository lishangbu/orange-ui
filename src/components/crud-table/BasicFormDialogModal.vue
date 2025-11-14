<template>
  <n-modal
    v-model:show="localShow"
    v-bind="filteredAttrs"
    preset="dialog"
    :loading="loading"
    :positive-button-props="{ loading }"
    :on-positive-click="onPositiveClick"
    :on-negative-click="onNegativeClick"
    :on-after-enter="onAfterEnter"
  >
    <BasicForm
      ref="basicFormRef"
      :model-value="localModel"
      :formOptions="formOptions"
      @update:model-value="handleFormUpdate"
    />
  </n-modal>
</template>

<script lang="ts">
import { omit } from 'lodash-es'
import { type FormValidationError, NModal } from 'naive-ui'
import { computed, defineComponent, ref, toRefs, useAttrs, watch } from 'vue'

import BasicForm from './BasicForm.vue'

import type { FormOptions } from './types'

export default defineComponent({
  name: 'BasicFormDialogModal',
  components: { NModal, BasicForm },
  props: {
    // 控制弹窗显示/隐藏
    show: {
      type: Boolean as () => boolean,
      default: false,
    },
    formOptions: {
      type: Object as () => FormOptions,
      required: true,
    },
    // 表单初始数据（复用为数据源）
    modelValue: {
      type: Object as () => Record<string, unknown>,
      default: () => ({}),
    },
    // 初始数据转换函数（可用于设置默认值）
    transformInitialData: {
      type: Function as unknown as () => (data: Record<string, unknown>) => Record<string, unknown>,
      default: undefined,
    },
  },
  emits: ['update:show', 'submit'],
  setup(props, { emit }) {
    const attrs = useAttrs() as Record<string, any>
    // filter out `preset` from attrs to avoid passing it to NModal
    const filteredAttrs = computed(() => omit(attrs, ['preset']))

    const { show, modelValue } = toRefs(props)
    const localShow = ref(!!show.value)
    watch(show, (v) => (localShow.value = !!v))
    watch(localShow, (v) => emit('update:show', v))

    const basicFormRef = ref<any>()
    // 表单的本地数据
    const localModel = ref<Record<string, unknown>>({})

    // 标志位：防止循环更新
    let isUpdatingFromForm = false

    /**
     * 处理 BasicForm 的更新事件
     */
    function handleFormUpdate(newValue: Record<string, unknown>) {
      if (isUpdatingFromForm) return
      isUpdatingFromForm = true
      localModel.value = newValue
      Promise.resolve().then(() => {
        isUpdatingFromForm = false
      })
    }

    /**
     * 弹窗打开动画完成后的回调
     * 在这里初始化表单数据，避免 watch 循环
     */
    function onAfterEnter() {
      isUpdatingFromForm = true
      let data = { ...(modelValue.value || {}) }
      // 如果提供了转换函数，则应用转换
      if (props.transformInitialData) {
        data = props.transformInitialData(data)
      }
      localModel.value = data
      Promise.resolve().then(() => {
        isUpdatingFromForm = false
      })
    }


    const loading = ref(false)

    /**
     * 处理确认按钮点击事件
     * 通过 loading 状态防止重复触发
     * 返回 false 阻止 Modal 关闭，等待异步验证完成
     */
    function onPositiveClick() {
      // 如果正在加载中，直接返回 false，不执行任何操作
      if (loading.value) {
        return false
      }

      loading.value = true

      // 执行异步验证
      basicFormRef?.value?.validateForm((errors?: Array<FormValidationError>) => {
        if (errors) {
          console.error('表单校验失败:', errors)
          loading.value = false
          // 校验失败，不关闭弹窗
        } else {
          // 校验通过，提交并关闭
          emit('submit', { ...localModel.value })
          loading.value = false
          localShow.value = false
        }
      })

      // 返回 false 阻止 Modal 立即关闭，等待验证完成
      return false
    }

    function onNegativeClick() {
      localShow.value = false
    }

    const positiveText = (attrs['positive-text'] ?? attrs['positiveText']) as string | undefined
    const negativeText = (attrs['negative-text'] ?? attrs['negativeText']) as string | undefined

    return {
      localShow,
      basicFormRef,
      localModel,
      onPositiveClick,
      onNegativeClick,
      onAfterEnter,
      handleFormUpdate,
      loading,
      filteredAttrs,
      positiveText,
      negativeText,
    }
  },
})
</script>
