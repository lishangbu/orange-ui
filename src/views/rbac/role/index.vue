<script setup lang="ts">
import { NInput, NSelect, NSwitch, NTag } from 'naive-ui'
import { computed, h } from 'vue'

import { createRole, deleteRole, getRolePage, updateRole } from '@/api/rbac/role'
import { CrudTable, ScrollContainer } from '@/components'

import type { FormOptions } from '@/components/crud-table/types'
import type { Role } from '@/types/modules/rbac/role'

// 表格列配置
const columns = [
  { title: 'ID', key: 'id', width: 200 },
  { title: '角色编码', key: 'code' },
  { title: '角色名称', key: 'name' },
  {
    title: '启用状态',
    key: 'enabled',
    render(row: Role) {
      return row.enabled
        ? h(NTag, { type: 'success', size: 'small' }, { default: () => '启用' })
        : h(NTag, { type: 'error', size: 'small' }, { default: () => '禁用' })
    },
  },
]

// 表单项配置
const formOptions = computed<FormOptions>(() => ({
  formProps: {
    labelPlacement: 'top',
    rules:{
      code: { required: true, message: '角色编码不能为空', trigger: ['blur'] },
      name: { required: true, message: '角色名称不能为空', trigger: ['blur'] },
    }
  },
  gridProps: { cols: 1 },
  formItemProps: [
    {
      label: '角色编码',
      path: 'code',
      component: NInput,
      componentProps: {
        placeholder: '请输入角色编码',
      },
    },
    {
      label: '角色名称',
      path: 'name',
      rule: {
        required: true,
        trigger: ['input', 'blur'],
        message: '角色名称不能为空',
      },
      component: NInput,
      componentProps: {
        placeholder: '请输入角色名称',
      },
    },
    {
      label: '启用状态',
      path: 'enabled',
      required: true,
      component: NSwitch,
      componentProps: {
        placeholder: '请选择启用状态',
      },
    },
  ],
}))

/**
 * 初始数据转换函数
 * 为新增角色时的 enabled 字段设置默认值 true
 */
function transformInitialData(data: Record<string, unknown>): Record<string, unknown> {
  // 如果没有 id，说明是新增模式
  if (!data.id && data.enabled === undefined) {
    return { ...data, enabled: true }
  }
  return data
}

// 查询表单项配置
const searchFormOptions = computed<FormOptions>(() => ({
  formProps: { labelPlacement: 'top' },
  gridProps: { cols: 1 },
  formItemProps: [
    {
      label: '角色编码',
      path: 'code',
      component: NInput,
      componentProps: {
        placeholder: '请输入角色编码进行搜索',
      },
    },
    {
      label: '角色名称',
      path: 'name',
      component: NInput,
      componentProps: {
        placeholder: '请输入角色名称进行搜索',
      },
    },
    {
      label: '启用状态',
      path: 'enabled',
      component: NSelect,
      componentProps: {
        placeholder: '请选择启用状态',
        options: [
          { label: '启用', value: 'true' },
          { label: '禁用', value: 'false' },
        ],
        clearable: true,
      },
    },
  ],
}))
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <CrudTable
      :columns="columns"
      :form-options="formOptions"
      :search-form-options="searchFormOptions"
      :transform-initial-data="transformInitialData"
      :page="getRolePage"
      :create="createRole"
      :update="updateRole"
      :remove="deleteRole"
    />
  </ScrollContainer>
</template>

<style scoped></style>
