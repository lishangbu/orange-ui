<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput } from 'naive-ui'
import { computed, reactive, ref, toRaw, watch } from 'vue'
import type { ButtonProps } from 'naive-ui/es/button/src/Button'
import type { ButtonConfig, FieldConfig } from '@/components'

// 只声明自定义 props，其他属性透传
const props = defineProps<{
  fields: FieldConfig[]
  modelValue?: Record<string, any>
  buttons?: ButtonProps[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, any>): void
  (e: 'submit', v: Record<string, any>): void
  (e: 'reset'): void
  (e: 'validateFail', err: any): void
}>()

const formRef = ref<any>()
const formModel = reactive<Record<string, any>>({})

// 默认按钮配置
const defaultButtons: ButtonConfig[] = [
  {
    label: '重置',
    type: 'default',
    onClick: () => reset(),
  },
  {
    label: '提交',
    type: 'primary',
    onClick: () => submit(),
  },
]

const renderButtons = computed<ButtonConfig[]>(() => {
  return props.buttons && props.buttons.length > 0 ? (props.buttons as ButtonConfig[]) : defaultButtons
})

function initModel() {
  const src = props.modelValue ?? {}
  for (const k of Object.keys(formModel)) delete formModel[k as string]
  for (const f of props.fields ?? []) {
    formModel[f.key as string] = f.key in src ? src[f.key as string] : undefined
  }
  for (const [k, v] of Object.entries(src)) {
    if (!(k in formModel)) formModel[k as string] = v
  }
}

initModel()

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    for (const [k, val] of Object.entries(v)) {
      formModel[k as string] = val
    }
  },
  { deep: true },
)

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
    if (errors) emit('validateFail', errors)
    else emit('submit', toRaw(formModel))
  })
}

function reset() {
  const src = props.modelValue ?? {}
  for (const f of props.fields ?? []) {
    formModel[f.key as string] = f.key in src ? src[f.key as string] : undefined
  }
  emit('reset')
}

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
    v-bind="$attrs"
    :model="formModel"
    ref="formRef"
  >
    <template
      v-for="field in props.fields"
      :key="field.key"
    >
      <NFormItem
        v-bind="field.formItemProps ?? {}"
        :path="(field.formItemProps && (field.formItemProps.path as any)) ?? field.key"
        :label="
          (field.formItemProps && (field.formItemProps.label as any)) ?? field.label ?? field.key
        "
      >
        <component
          :is="field.component ?? NInput"
          v-model:value="formModel[field.key]"
          v-bind="field.componentProps ?? {}"
          :placeholder="field.placeholder"
        />
      </NFormItem>
    </template>
    <div>
      <slot name="footer">
        <div class="flex items-center justify-end gap-2">
          <NButton
            v-for="(btn, idx) in renderButtons"
            :key="idx"
            :type="btn.type ?? 'default'"
            v-bind="$attrs"
            @click="btn.onClick && btn.onClick(formModel)"
          >
            {{ btn.label }}
          </NButton>
        </div>
      </slot>
    </div>
  </NForm>
</template>
