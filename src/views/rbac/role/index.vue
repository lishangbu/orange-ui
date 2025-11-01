<script setup lang="ts">
import { NSelect, NSwitch, NTag } from 'naive-ui'
import { computed, h, ref } from 'vue'

import { createRole, deleteRole, getRolePage, updateRole } from '@/api/rbac/role'
import type { FieldProps } from '@/components'
import { CrudTable, ScrollContainer } from '@/components'

import type { Role } from '@/types/modules/rbac/role'

const roleEnabled = ref<boolean>(true)

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
const fields = computed<FieldProps[]>(() => [
  {
    label: '角色编码',
    path: 'code',
    rule: {
      required: true,
      trigger: ['input', 'blur'],
      message: '角色编码不能为空',
    },
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
  },
  {
    label: '启用状态',
    path: 'enabled',
    required: true,
    component: NSwitch,
    componentProps: {
      value: roleEnabled.value,
      onUpdateValue(value: boolean) {
        roleEnabled.value = value
      },
    },
  },
])

// 查询表单项配置
const searchFields: FieldProps[] = [
  {
    label: '角色编码',
    path: 'code',
    componentProps: {
      placeholder: '请输入角色编码进行搜索',
    },
  },
  {
    label: '角色名称',
    path: 'name',
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
]
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <CrudTable
      :columns="columns"
      :fields="fields"
      :search-fields="searchFields"
      :page="getRolePage"
      :create="createRole"
      :update="updateRole"
      :remove="deleteRole"
    />
  </ScrollContainer>
</template>

<style scoped></style>
