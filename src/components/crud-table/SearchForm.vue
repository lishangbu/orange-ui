<script lang="ts" setup>
import { NButton, NButtonGroup, NForm, NFormItemGi, NGrid, NInput } from 'naive-ui'
import type { Component } from 'vue'
import { h, ref } from 'vue'
import type { FieldConfig } from '@/components'

/**
 * 通用查询表单组件
 * @prop {Array} fields - 查询项配置，包含 label、key、component、props、placeholder 等
 * @prop {boolean} loading - 查询按钮 loading 状态
 * @emits search - 查询事件，点击查询按钮时触发，参数为当前表单值
 */
defineProps<{
  fields: FieldConfig[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', v: Record<string, any>): void
}>()

const form = ref<Record<string, any>>({})

function handleSearch() {
  emit('search', { ...form.value })
}

function handleReset() {
  // 清空所有字段
  for (const key of Object.keys(form.value)) {
    form.value[key] = ''
  }
  emit('search', { ...form.value })
}
</script>

<template>
  <NForm
    inline
    :model="form"
    class="mb-0 flex-1"
    @keyup.enter="handleSearch"
  >
    <NGrid
      :cols="5"
      x-gap="8"
      y-gap="4"
    >
      <template
        v-for="field in fields"
        :key="field.key"
      >
        <NFormItemGi
          :label="field.label"
          :path="field.key"
          v-bind="field.formItemProps ?? {}"
        >
          <Component
            :is="field.component || NInput"
            v-model:value="form[field.key]"
            v-bind="field.componentProps"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
          />
        </NFormItemGi>
      </template>
      <NFormItemGi suffix>
        <NButtonGroup size="small">
          <NButton
            type="primary"
            :loading="loading"
            @click="handleSearch"
            :renderIcon="() => h('span', { class: 'iconify-[mdi--search]' })"
            >搜索</NButton
          >
          <NButton
            @click="handleReset"
            :disabled="loading"
            :renderIcon="() => h('span', { class: 'iconify-[mdi--clear]' })"
            >重置</NButton
          >
        </NButtonGroup>
      </NFormItemGi>
    </NGrid>
  </NForm>
</template>
