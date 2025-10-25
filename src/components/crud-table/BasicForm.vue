<script setup lang="ts">
import { NForm, NFormItemGi, NGrid, NInput } from 'naive-ui'
import { reactive, ref, toRaw, watch } from 'vue'
import type { FieldConfig } from '@/components'

// 只声明自定义 props，其他属性透传
const props = defineProps<{
  fields: FieldConfig[]
  modelValue?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, any>): void
}>()

const formRef = ref<any>()
const formModel = reactive<Record<string, any>>({})

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
</script>

<template>
  <NForm
    v-bind="$attrs"
    :model="formModel"
    ref="formRef"
  >
    <NGrid :cols="24">
      <template
        v-for="field in props.fields"
        :key="field.key"
      >
        <NFormItemGi
          v-bind="field.formItemProps ?? {}"
          :path="(field.formItemProps && (field.formItemProps.path as any)) ?? field.key"
          :label="
            (field.formItemProps && (field.formItemProps.label as any)) ?? field.label ?? field.key
          "
          :span="field.formItemProps?.span ?? 24"
        >
          <component
            :is="field.component ?? NInput"
            v-model:value="formModel[field.key]"
            v-bind="field.componentProps ?? {}"
            :placeholder="field.placeholder"
          />
        </NFormItemGi>
      </template>
    </NGrid>
    <div>
      <slot name="footer" />
    </div>
  </NForm>
</template>
