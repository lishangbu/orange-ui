<script setup lang="ts">
import type { FieldConfig } from '@/components'
import { CrudTable, ScrollContainer } from '@/components'
import {
  createOrganization,
  getOrganizationPage,
  removeOrganizationByAncestorId,
  updateOrganization,
} from '@/api/rbac/organization'
import { NInputNumber } from 'naive-ui'
import type { TableColumns } from 'naive-ui/es/data-table/src/interface'

// 表格列配置
const columns: TableColumns = [
  { title: 'ID', key: 'id' },
  { title: '组织名称', key: 'name' },
  { title: '组织编码', key: 'code' },
  { title: '排序', key: 'sortOrder' },
  { title: '备注', key: 'remark' },
]

// 表单项配置
const fields: FieldConfig[] = [
  { label: '组织名称', key: 'name', required: true },
  { label: '组织编码', key: 'code', required: true },
  { label: '排序', key: 'sortOrder', component: NInputNumber, required: true, props: { min: 1 } },
  {
    label: '备注',
    key: 'remark',
    props: { type: 'textarea', autosize: { minRows: 2, maxRows: 4 } },
  },
]

// 查询表单项配置
const searchFields: FieldConfig[] = [
  { label: '组织名称', key: 'name' },
  { label: '组织编码', key: 'code' },
]
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <CrudTable
      :columns="columns"
      :fields="fields"
      :search-fields="searchFields"
      :page="getOrganizationPage"
      :create="createOrganization"
      :update="updateOrganization"
      :remove="removeOrganizationByAncestorId"
    />
  </ScrollContainer>
</template>

<style scoped></style>
