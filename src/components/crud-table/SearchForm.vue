<template>
  <div class="flex items-end gap-3">
    <div class="flex-1">
      <BasicForm
        ref="formRef"
        :modelValue="formModel"
        @update:modelValue="handleFormModelUpdate"
        :formOptions="formOptions"
      >
        <template #suffix>
          <n-grid-item suffix>
            <n-button @click="onReset" ghost>{{ resetText }}</n-button>
            <n-button type="primary" @click="onSearch">{{ searchText }}</n-button>
          </n-grid-item>
        </template>
      </BasicForm>
    </div>
  </div>
</template>

<script lang="ts">
import { NButton,NGridItem } from 'naive-ui'
import { defineComponent, ref, watch, toRefs } from 'vue'

import BasicForm from './BasicForm.vue'

import type { FormOptions } from './types'

export default defineComponent({
  name: 'SearchForm',
  components: { BasicForm, NButton,NGridItem },
  props: {
    modelValue: {
      type: Object as () => Record<string, unknown>,
      default: () => ({})
    },
    formOptions: {
      type: Object as () => FormOptions,
      required: true
    },
    resetText: {
      type: String,
      default: '重置'
    },
    searchText: {
      type: String,
      default: '查询'
    }
  },
  emits: ['update:modelValue', 'search', 'reset'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const formRef = ref<any>()

    // 使用 ref 维护本地状态，支持立即读写
    const formModel = ref<Record<string, unknown>>({ ...(modelValue.value || {}) })

    // 只监听父组件的更新，单向同步 props.modelValue -> formModel
    watch(
      modelValue,
      (newVal) => {
        formModel.value = { ...(newVal || {}) }
      },
      { deep: true }
    )

    function handleFormModelUpdate(newVal: Record<string, unknown>) {
      formModel.value = newVal
      emit('update:modelValue', { ...newVal })
    }

    function onSearch() {
      emit('search', { ...(formModel.value || {}) })
    }

    async function onReset() {
      emit('update:modelValue', {})
      emit('reset')
      // 等待父组件更新 props.modelValue，watch 会自动同步 formModel.value
      await Promise.resolve()
      // 调用 BasicForm 的 resetForm 重置其内部状态和验证
      if (formRef.value && typeof formRef.value.resetForm === 'function') {
        formRef.value.resetForm()
      }
    }

    return {
      formModel,
      formRef,
      onSearch,
      onReset,
      handleFormModelUpdate
    }
  }
})
</script>
