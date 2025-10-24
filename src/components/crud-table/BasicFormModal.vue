<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { NModal } from 'naive-ui'

import BasicForm from '@/components/crud-table/BasicForm.vue'
import type { FieldConfig } from '@/components'
import type { ButtonConfig } from '@/components/crud-table/interface.ts'

/**
 * 通用操作弹窗组件
 * @prop {boolean} visible - 弹窗显示状态
 * @prop {object} modelValue - 表单数据
 * @prop {'create' | 'edit'} mode - 弹窗模式
 * @prop {boolean} loading - 提交按钮 loading 状态
 * @prop {Array} fields - 表单项配置，包含 label、key、component 等
 * @emits update:visible - 控制弹窗显示
 * @emits submit - 表单提交
 */
const props = defineProps<{
  visible: boolean
  modelValue: Record<string, any>
  mode: 'create' | 'edit'
  loading?: boolean
  fields: FieldConfig[]
}>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', v: Record<string, any>): void
}>()

const form = ref<Record<string, any>>({})

// 适配 BasicForm 的字段配置，尽可能复用已有类型
const basicFormFields = computed<FieldConfig[]>(() =>
  props.fields.map((f) => ({
    key: f.key,
    label: f.label,
    component: f?.component,
    componentProps: f?.componentProps,
    placeholder: f?.placeholder || `请输入${f.label}`,
    formItemProps: f?.formItemProps,
  })),
)

watch(
  [() => props.visible, () => props.modelValue],
  ([visible, modelValue]) => {
    if (visible) {
      // 深拷贝，确保响应式且不会污染原始数据
      form.value = modelValue ? JSON.parse(JSON.stringify(modelValue)) : {}
    }
  },
  { immediate: true },
)

function handleClose() {
  emit('update:visible', false)
}
function handleSubmit() {
  emit('submit', { ...form.value })
}
const title = computed(() => (props.mode === 'create' ? '新增' : '编辑'))
const confirmButtonLabel = computed(() => (props.mode === 'create' ? '确认新增' : '确认修改'))
const cancelButtonLabel = computed(() => (props.mode === 'create' ? '取消新增' : '取消修改'))

const basicFormButtons = computed<ButtonConfig[]>(() => [
  {
    label: cancelButtonLabel.value,
    type: 'error',
    onClick: () => handleClose(),
  },
  {
    label: confirmButtonLabel.value,
    type: 'primary',
    loading: props.loading,
    onClick: () => handleSubmit(),
  },
])
</script>

<template>
  <n-modal
    :show="visible"
    preset="card"
    :title="title"
    @close="handleClose"
    class="w-full max-w-md"
  >
    <BasicForm
      v-model="form"
      :fields="basicFormFields"
      :buttons="basicFormButtons"
      label-placement="left"
      label-width="80"
      class="mb-0"
    />
  </n-modal>
</template>
