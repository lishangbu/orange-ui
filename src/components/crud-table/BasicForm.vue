<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, type FormProps, type FormItemProps, type FormItemGiProps } from 'naive-ui'
import { ref, reactive, watch, computed, toRaw } from 'vue'

// Field 结构：明确区分 formItemProps（传给 NFormItem）和 componentProps（传给渲染控件）
type Field = {
  key: string
  label?: string
  // 直接传给 NFormItem 的属性（例如 path / required / showError 等）
  formItemProps?: Partial<FormItemProps> & Partial<FormItemGiProps>
  // 用于渲染的组件（优先），未提供时回退为 NInput
  component?: any
  // 传给渲染组件（NSelect/NInputNumber/NDatePicker 或自定义组件）的 props
  componentProps?: Record<string, any>
  // 占位符快捷字段（部分控件会用到）
  placeholder?: string
}

// 扩展 Naive UI 的 FormProps，增加 fields 与 modelValue 等自定义项
type BasicFormProps = FormProps & {
  fields: Field[]
  modelValue?: Record<string, any>
  showDefaultFooter?: boolean
}

const props = defineProps<BasicFormProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, any>): void
  (e: 'submit', v: Record<string, any>): void
  (e: 'reset'): void
  (e: 'validateFail', err: any): void
}>()

// 表单引用与模型
const formRef = ref()
const formModel = reactive<Record<string, any>>({})

// 计算只传递给 NForm 的属性，排除 fields、modelValue、showDefaultFooter 等自定义字段
const formAttrs = computed(() => {
  // 复制一份 props，并删除我们不希望传给 NForm 的自定义字段
  const rest = { ...(props as any) }
  delete rest.fields
  delete rest.modelValue
  delete rest.showDefaultFooter
  return rest as Partial<FormProps>
})

// 初始化 model
function initModel() {
  // 将 props.modelValue 中已有字段合并
  const src = props.modelValue ?? {}
  // 清空后赋值，保证响应性一致
  for (const k of Object.keys(formModel)) {
    delete (formModel as any)[k]
  }
  // 根据 fields 确保每个字段都有初始值（优先来自 modelValue）
  for (const f of props.fields ?? []) {
    ;(formModel as any)[f.key] = f.key in src ? (src as any)[f.key] : (undefined as any)
  }
  // 也把 modelValue 中不在 fields 的字段合并进去，避免丢失
  for (const [k, v] of Object.entries(src)) {
    if (!(k in formModel)) (formModel as any)[k] = v
  }
}

initModel()

// 同步外部 modelValue => 内部
watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    for (const [k, val] of Object.entries(v)) {
      ;(formModel as any)[k] = val
    }
  },
  { deep: true },
)

// 同步内部 model => 外部 v-model
watch(
  formModel,
  (v) => {
    emit('update:modelValue', toRaw(v))
  },
  { deep: true },
)

function submit() {
  if (!formRef.value || typeof formRef.value.validate !== 'function') {
    emit('submit', toRaw(formModel))
    return
  }
  formRef.value.validate((errors: any) => {
    if (errors) {
      emit('validateFail', errors)
    } else {
      emit('submit', toRaw(formModel))
    }
  })
}

function reset() {
  // 若外部传入 modelValue，重置为其值；否则清空字段
  const src = props.modelValue ?? {}
  for (const f of props.fields ?? []) {
    ;(formModel as any)[f.key] = f.key in src ? (src as any)[f.key] : (undefined as any)
  }
  emit('reset')
}

// 提供父组件通过 ref 调用的验证方法和操作
function validate(): Promise<{ valid: boolean; errors?: any }> {
  return new Promise((resolve) => {
    if (!formRef.value || typeof formRef.value.validate !== 'function') {
      resolve({ valid: true })
      return
    }
    formRef.value.validate((errors: any) => {
      if (errors) resolve({ valid: false, errors })
      else resolve({ valid: true })
    })
  })
}

defineExpose({ submit, reset, validate })
</script>

<template>
  <NForm
    v-bind="formAttrs"
    :model="formModel"
    ref="formRef"
  >
    <template
      v-for="field in fields"
      :key="field.key"
    >
      <NFormItem
        v-bind="field.formItemProps ?? {}"
        :path="(field.formItemProps && (field.formItemProps.path as any)) ?? field.key"
        :label="(field.formItemProps && (field.formItemProps.label as any)) ?? field.label ?? field.key"
      >
        <!-- 通过 field.component 渲染；若未提供则使用 NInput 作为默认控件 -->
        <component
          :is="field.component ?? NInput"
          v-model:value="formModel[field.key]"
          v-bind="field.componentProps ?? {}"
          :placeholder="field.placeholder"
        />
      </NFormItem>
    </template>

    <!-- 底部插槽：允许用户自定义按钮区域；默认提供提交/重置 -->
    <template #footer>
      <slot name="footer">
        <div
          v-if="props.showDefaultFooter ?? true"
          class="flex items-center justify-end gap-2"
        >
          <NButton
            type="default"
            @click="reset"
            >重置</NButton
          >
          <NButton
            type="primary"
            @click="submit"
            >提交</NButton
          >
        </div>
      </slot>
    </template>
  </NForm>
</template>
