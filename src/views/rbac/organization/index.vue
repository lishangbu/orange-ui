<script setup lang="ts">
import {
  type DataTableColumns,
  type DropdownProps,
  NDropdown,
  NInputNumber,
  useDialog,
  useMessage,
} from 'naive-ui'
import { h, nextTick, reactive, ref } from 'vue'

import {
  createOrganization,
  getOrganizationPage,
  removeOrganizationByAncestorId,
  removeOrganizationByAncestorIds,
  updateOrganization,
} from '@/api/rbac/organization'
import { BasicFormModal, CrudTable, ScrollContainer, type ButtonConfig, type FieldConfig } from '@/components'

import type { Organization, OrganizationTreeNode } from '@/types/modules/rbac/organization' // 表格列配置

// 表格列配置
const columns: DataTableColumns<OrganizationTreeNode> = [
  { type: 'selection' },
  { title: 'ID', key: 'id' },
  { title: '组织名称', key: 'name' },
  { title: '组织编码', key: 'code' },
  { title: '排序', key: 'sortOrder' },
  { title: '备注', key: 'remark' },
]

// 表单项配置
const fields: FieldConfig[] = [
  {
    label: '上级组织',
    key: 'parentId',
    formItemProps: {
      required: true,
      rule: {
        required: true,
        trigger: ['input', 'blur'],
        message: '上级组织不能为空',
      },
    },
  },
  {
    label: '组织名称',
    key: 'name',
    formItemProps: {
      required: true,
      rule: {
        required: true,
        trigger: ['input', 'blur'],
        message: '组织名称不能为空',
      },
    },
  },
  {
    label: '组织编码',
    key: 'code',
    formItemProps: {
      required: true,
      rule: {
        required: true,
        trigger: ['input', 'blur'],
        message: '组织编码不能为空',
      },
    },
  },
  {
    label: '排序',
    key: 'sortOrder',
    component: NInputNumber,
    formItemProps: {
      required: true,
      rule: {
        required: true,
        trigger: ['input', 'blur'],
        message: '排序必须不小于1',
        min: 1,
      },
    },
    componentProps: { min: 1 },
  },
  {
    label: '备注',
    key: 'remark',
    componentProps: { type: 'textarea', autosize: { minRows: 2, maxRows: 4 } },
  },
]

// 查询表单项配置
const searchFields: FieldConfig[] = [
  { label: '组织名称', key: 'name' },
  { label: '组织编码', key: 'code' },
]
const message = useMessage()
const dialog = useDialog()
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalLoading = ref(false)
const currentRow = ref<OrganizationTreeNode | undefined>()
const showDropdown = ref(false)
const checkedRowKeys = ref<Array<number | string>>([])
const tableRef = ref<InstanceType<typeof CrudTable> | null>(null)

const handleCreateRootNode = function () {
  modalMode.value = 'create'
  currentRow.value = undefined
  modalVisible.value = true
}
const handleRemoveNodes = function () {
  if (checkedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的组织')
    return
  }
  dialog.warning({
    title: '确认删除',
    content: `确定要删除选中的${checkedRowKeys.value.length}条数据吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      await removeOrganizationByAncestorIds(checkedRowKeys.value as string[])
      message.success('删除成功')
      checkedRowKeys.value = []
      // call crud table fetchPage to refresh and update pagination
      if (tableRef.value && typeof tableRef.value.fetchPage === 'function') {
        await tableRef.value.fetchPage()
      } else {
        // fallback to calling API and refreshing by reloading page data
        await getOrganizationPage()
      }
    },
  })
}

async function handleModalSubmit(payload: any) {
  modalLoading.value = true
  const action = modalMode.value === 'create' ? doCreate : doUpdate
  try {
    await action(payload)
    modalVisible.value = false
    message.success(modalMode.value === 'create' ? '新增成功' : '更新成功')
    // refresh the table via ref if available
    if (tableRef.value && typeof tableRef.value.fetchPage === 'function') {
      await tableRef.value.fetchPage()
    } else {
      await getOrganizationPage()
    }
  } finally {
    modalLoading.value = false
  }
}

async function doCreate(item: Partial<Organization>) {
  await createOrganization(item)
}

async function doUpdate(item: Partial<Organization>) {
  await updateOrganization(item)
}
const dropdownOptions = reactive<DropdownProps>({
  x: 0,
  y: 0,
  options: [
    {
      label: '编辑',
      key: 'edit',
      icon: () => h('span', { class: 'iconify-[mdi--edit]' }),
    },
    {
      label: () => h('span', { style: { color: 'red' } }, '删除'),
      key: 'delete',
      icon: () => h('span', { class: 'iconify-[mdi--delete]', style: { color: 'red' } }),
    },
  ],
  onClickoutside: () => {
    showDropdown.value = false
  },
  onSelect: () => {
    console.info(JSON.stringify(currentRow.value))
    showDropdown.value = false
  },
})
function rowProps(row: OrganizationTreeNode) {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      showDropdown.value = false
      nextTick().then(() => {
        currentRow.value = row
        showDropdown.value = true
        dropdownOptions.x = e.clientX
        dropdownOptions.y = e.clientY
      })
    },
  }
}
const headerActionButtons: ButtonConfig[] = [
  {
    label: '新增根组织',
    size: 'small',
    type: 'primary',
    renderIcon: () => h('span', { class: 'iconify-[mdi--add]' }),
    onClick: () => handleCreateRootNode(),
  },
  {
    label: '删除选中组织',
    size: 'small',
    type: 'error',
    renderIcon: () => h('span', { class: 'iconify-[mdi--delete]' }),
    onClick: () => handleRemoveNodes(),
  },
]
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <CrudTable
      ref="tableRef"
      :show-action-column="false"
      :row-props="rowProps"
      :header-action-buttons="headerActionButtons"
      v-model:checked-row-keys="checkedRowKeys"
      :row-key="(rowData: OrganizationTreeNode) => rowData.id"
      :columns="columns"
      :fields="fields"
      :search-fields="searchFields"
      :page="getOrganizationPage"
      :create="createOrganization"
      :update="updateOrganization"
      :remove="removeOrganizationByAncestorId"
    />
    <BasicFormModal
      v-if="fields && fields.length"
      v-model:visible="modalVisible"
      :modelValue="currentRow"
      :mode="modalMode"
      :loading="modalLoading"
      :fields="fields"
      @submit="handleModalSubmit"
    />
    <NDropdown
      placement="bottom-start"
      trigger="manual"
      v-bind="dropdownOptions"
      :show="showDropdown"
    />
  </ScrollContainer>
</template>

<style scoped></style>
