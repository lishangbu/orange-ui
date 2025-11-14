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
            @update:value="(val) => handleUpdateFn(val, item.path)"
          />
          <slot
            v-else
            :item="item"
            :modelValue="innerModel[item.path as string]"
            :onUpdate="(val) => handleUpdateFn(val, item.path)"
          ></slot>
        </n-form-item>
      </n-grid-item>
      <slot name="suffix"></slot>
    </n-grid>
  </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NGrid, NGridItem } from 'naive-ui'
import { defineExpose, reactive, ref, toRefs, watch } from 'vue'

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

/**
 * 防止循环更新的标志位
 *
 * 数据流：
 * 1. 父组件更新 modelValue → watch(modelValue) → 更新 innerModel
 * 2. 用户输入 → innerModel 变化 → watch(innerModel) → emit update:modelValue
 *
 * 如果没有标志位：
 * - 步骤1会触发步骤2的watch → 不必要的emit
 * - 步骤2的emit可能导致父组件更新modelValue → 又触发步骤1 → 无限循环
 *
 * 因此两个标志位都是必要的：
 * - isUpdatingFromParent: 在处理父组件的更新时，阻止 innerModel watch 触发 emit
 * - isUpdatingToParent: 在 emit 后父组件可能同步更新 modelValue 时，阻止重复处理
 */
let isUpdatingFromParent = false
let isUpdatingToParent = false

// keep innerModel in sync when parent modelValue changes
watch(
  modelValue,
  (v) => {
    // 防止因为 emit 导致的循环：如果当前正在 emit，则忽略父组件的更新
    if (isUpdatingToParent) return

    isUpdatingFromParent = true
    Object.keys(innerModel).forEach((k) => delete innerModel[k])
    if (v && typeof v === 'object') {
      Object.keys(v).forEach((k) => (innerModel[k] = v[k]))
    }
    // 使用微任务确保 innerModel 的 watch 能够检测到 isUpdatingFromParent 标志
    Promise.resolve().then(() => {
      isUpdatingFromParent = false
    })
  },
  { deep: true },
)

// emit updates when innerModel changes
watch(
  innerModel,
  () => {
    // 防止不必要的 emit：如果是因为父组件更新导致的 innerModel 变化，则不 emit
    if (isUpdatingFromParent) return

    isUpdatingToParent = true
    emit('update:modelValue', { ...innerModel })
    // 使用微任务确保 emit 完成后再重置标志
    Promise.resolve().then(() => {
      isUpdatingToParent = false
    })
  },
  { deep: true },
)

// formInst ref
const formInstRef = ref<FormInst>()

function handleUpdateFn(val: unknown, path?: string | number | symbol) {
  if (typeof path === 'string' || typeof path === 'number') {
    innerModel[String(path)] = val
  }
}

function resetForm() {
  Object.keys(innerModel).forEach((k) => delete innerModel[k])
  if (modelValue.value && typeof modelValue.value === 'object') {
    const mv = modelValue.value as Record<string, unknown>
    Object.keys(mv).forEach((k) => {
      innerModel[k] = mv[k]
    })
  }
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
