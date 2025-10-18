<script setup lang="ts">
import { h } from 'vue'
import { NTag, NSwitch, NSelect } from 'naive-ui'
import { CrudTable, ScrollContainer } from '@/components'
import { getRolePage, createRole, updateRole, deleteRole } from '@/api/rbac/role'
import type { FieldConfig } from '@/components'
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
    }
  }
]

// 表单项配置
const fields: FieldConfig[] = [
  { label: '角色编码', key: 'code' },
  { label: '角色名称', key: 'name' },
  {
    label: '启用状态',
    key: 'enabled',
    component: NSwitch,
    props: { checkedValue: true, uncheckedValue: false }
  }
]

// 查询表单项配置
const enabledOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]

const searchFields: FieldConfig[] = [
  { label: '角色编码', key: 'code' },
  { label: '角色名称', key: 'name' },
  {
    label: '启用状态',
    key: 'enabled',
    component: NSelect,
    placeholder: '请选择启用状态',
    props: {
      options: enabledOptions,
      clearable: true
    }
  }
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
