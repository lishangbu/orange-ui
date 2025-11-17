<template>
  <n-form
    ref="formInstRef"
    :model="innerModel"
    v-bind="props.formOptions?.formProps"
  >
    <n-grid v-bind="props.formOptions?.gridProps">
      <n-grid-item
        v-for="(item, idx) in props.formOptions?.formItemProps"
        :key="item.path || idx"
      >
        <n-form-item
          :label="item.label"
          :path="item.path"
          :show-label="item.label !== undefined"
          :required="item.required"
        >
          <component
            v-if="item.component"
            :is="item.component"
            v-bind="item.componentProps"
            :value="innerModel[item.path as string]"
            @update:value="createUpdateHandler(item.path)"
          />
          <slot
            v-else
            :item="item"
            :modelValue="innerModel[item.path as string]"
            :onUpdate="createUpdateHandler(item.path)"
          ></slot>
        </n-form-item>
      </n-grid-item>
      <slot name="suffix"></slot>
    </n-grid>
  </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NGrid, NGridItem } from 'naive-ui'
import { reactive, ref, toRefs, watch } from 'vue'

import type { FormOptions } from './types'
import type { FormInst, FormValidationError } from 'naive-ui'

// Props & emits
const props = defineProps<{
  modelValue: Record<string, unknown>
  formOptions: FormOptions
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: Record<string, unknown>): void }>()

// inner reactive model copied from modelValue
const { modelValue } = toRefs(props)
const innerModel = reactive<Record<string, unknown>>({ ...(modelValue.value || {}) })

// 单向同步：父组件更新 modelValue → 更新 innerModel
watch(
  modelValue,
  (v) => {
    // 清空并重新赋值
    Object.keys(innerModel).forEach((k) => delete innerModel[k])
    if (v && typeof v === 'object') {
      Object.keys(v).forEach((k) => (innerModel[k] = v[k]))
    }
  },
  { deep: true },
)

// formInst ref
const formInstRef = ref<FormInst>()

function handleUpdateFn(val: unknown, path?: string | number | symbol) {
  if (typeof path === 'string' || typeof path === 'number') {
    // 直接更新 innerModel
    innerModel[String(path)] = val
    // 立即 emit 通知父组件（由父组件决定是否更新 props）
    emit('update:modelValue', { ...innerModel })
  }
}

// factory to create update handlers to avoid inline arrow functions in template (TS implicit any issue)
function createUpdateHandler(path?: string | number | symbol) {
  return (val: unknown) => handleUpdateFn(val, path)
}

function resetForm() {
  // 清空 innerModel 并同步 props.modelValue 的值
  Object.keys(innerModel).forEach((k) => delete innerModel[k])
  if (modelValue.value && typeof modelValue.value === 'object') {
    const mv = modelValue.value as Record<string, unknown>
    Object.keys(mv).forEach((k) => {
      innerModel[k] = mv[k]
    })
  }
  // 恢复验证状态
  formInstRef.value?.restoreValidation()
}

function validateForm(validateCallback?: (errors: Array<FormValidationError> | undefined) => void) {
  formInstRef.value
    ?.validate((errors) => {
      if (validateCallback) {
        validateCallback(errors)
      }
    })
    .catch((err) => {
      if (validateCallback) {
        validateCallback(err)
      }
    })
}

defineExpose({ validateForm, resetForm })
</script>
