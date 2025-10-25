<script setup lang="ts">
import {
  type DataTableColumns,
  type DropdownProps,
  NButton,
  NDropdown,
  NInputNumber,
  useMessage,
} from 'naive-ui'

import {
  createOrganization,
  getOrganizationPage,
  removeOrganizationByAncestorId,
  updateOrganization,
} from '@/api/rbac/organization'
import { h, nextTick, reactive, ref } from 'vue'
import type { FieldConfig } from '@/components'
import { BasicFormModal, CrudTable, ScrollContainer } from '@/components'
import type { Organization, OrganizationTreeNode } from '@/types/modules/rbac/organization'

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
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalLoading = ref(false)
const currentRow = ref<OrganizationTreeNode | undefined>()
const showDropdown = ref(false)
const checkedRowKeys = ref<Array<number | string>>([])
const handleCreateRootNode = function () {}
async function handleModalSubmit(payload: any) {
  modalLoading.value = true
  const action = modalMode.value === 'create' ? doCreate : doUpdate
  try {
    await action(payload)
    modalVisible.value = false
    await getOrganizationPage()
  } finally {
    modalLoading.value = false
  }
}
async function doCreate(item: Partial<Organization>) {
  await createOrganization(item)
  message.success('新增成功')
}

async function doUpdate(item: Partial<Organization>) {
  await updateOrganization(item)
  message.success('更新成功')
}
const dropdownOptions = reactive<DropdownProps>({
  x: 0,
  y: 0,
  options: [
    {
      label: '编辑',
      key: 'edit',
    },
    {
      label: () => h('span', { style: { color: 'red' } }, '删除'),
      key: 'delete',
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
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <CrudTable
      :show-action-column="false"
      :show-header-action="false"
      :row-props="rowProps"
      v-model:checked-row-keys="checkedRowKeys"
      :row-key="(rowData: OrganizationTreeNode) => rowData.id"
      :columns="columns"
      :fields="fields"
      :search-fields="searchFields"
      :page="getOrganizationPage"
      :create="createOrganization"
      :update="updateOrganization"
      :remove="removeOrganizationByAncestorId"
    >
      <template #header-action-buttons>
        <NButton
          type="primary"
          size="small"
          @click="handleCreateRootNode"
        >
          <template #icon>
            <span class="iconify-[mdi--add]" />
          </template>
          新增根节点
        </NButton>
      </template>
    </CrudTable>
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
