<template>
  <div>
    <SearchForm
      v-if="searchFields && searchFields.length && showSearchForm"
      :fields="searchFields"
      :loading="loading"
      @search="handleSearch"
      class="mb-4"
    />

    <div class="mb-4 flex items-center justify-end gap-2">
      <template v-if="computedHeaderActionButtons?.length > 0 && showHeaderAction">
        <NButton
          v-for="btn in computedHeaderActionButtons"
          :key="btn.label"
          :size="btn.size ?? 'small'"
          :type="btn.type as any"
          :render-icon="() => btn.renderIcon && btn.renderIcon()"
          @click="() => btn.onClick && btn.onClick()"
        >
          {{ btn.label }}
        </NButton>
      </template>
      <span
        @click="() => (showSearchForm = !showSearchForm)"
        class="iconify-[mdi--search] cursor-pointer text-xl transition-colors duration-200"
      />
    </div>

    <NDataTable
      v-bind="attrs"
      :columns="tableColumns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      remote
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
  </div>
</template>

<script setup lang="ts">
import {
  type DataTableColumn,
  NButton,
  NDataTable,
  type PaginationProps,
  useDialog,
  useMessage,
} from 'naive-ui'
import { computed, h, reactive, ref, useAttrs, withDefaults } from 'vue'

import BasicFormModal from './BasicFormModal.vue'
import SearchForm from './SearchForm.vue'

import type { ButtonConfig, TableConfig } from './types'

const props = withDefaults(defineProps<TableConfig>(), {
  fields: () => [],
  searchFields: () => [],
  actionButtons: undefined,
  showActionColumn: true,
  showHeaderAction: true,
  headerActionButtons: undefined,
})

const message = useMessage()
const dialog = useDialog()
const attrs = useAttrs()

const data = ref<any[]>([])
const loading = ref(false)
const query = reactive<Record<string, any>>({})

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50, 100, 200, 500],
  showQuickJumper: false,
  showQuickJumpDropdown: false,
  pageCount: 1,
  itemCount: undefined,
  prefix({ itemCount }) {
    return `共 ${itemCount ?? 0} 条`
  },
  onUpdatePage: (page: number) => {
    pagination.page = page
    void fetchPage()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    void fetchPage()
  },
})

async function fetchPage() {
  if (!props.page) return
  loading.value = true
  const current = (pagination.page as number) ?? 1
  const size = (pagination.pageSize as number) ?? 10
  try {
    const res = await props.page({ current, size, ...query })
    data.value = res?.data?.records ?? []
    pagination.pageCount = Number(res?.data?.pages) ?? 0
    pagination.itemCount = Number(res?.data?.total) ?? 0
  } finally {
    loading.value = false
  }
}

async function doCreate(item: Partial<any>) {
  if (!props.create) return
  await props.create(item)
  message.success('新增成功')
}

async function doUpdate(item: Partial<any>) {
  if (!props.update) return
  await props.update(item)
  message.success('更新成功')
}

async function doRemove(id: string | number) {
  if (!props.remove) return
  await props.remove(id)
  message.success('删除成功')
}

void fetchPage()

const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalLoading = ref(false)
const currentRow = ref<any>({})
const showSearchForm = ref(false)

function handleCreate() {
  modalMode.value = 'create'
  currentRow.value = {}
  modalVisible.value = true
}

function handleEdit(row: any) {
  modalMode.value = 'edit'
  currentRow.value = { ...row }
  modalVisible.value = true
}

function handleDelete(row: any) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除ID为「${row.id}」的数据吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      await doRemove(row.id)
      await fetchPage()
    },
  })
}

async function handleModalSubmit(payload: any) {
  modalLoading.value = true
  const action = modalMode.value === 'create' ? doCreate : doUpdate
  try {
    await action(payload)
    modalVisible.value = false
    await fetchPage()
  } finally {
    modalLoading.value = false
  }
}

function handleSearch(searchParams: Record<string, any>) {
  const params = searchParams ?? {}

  if (!params || Object.keys(params).length === 0) {
    for (const key of Object.keys(query)) {
      delete (query as any)[key]
    }
  } else {
    for (const key of Object.keys(query)) {
      if (!(key in params)) {
        delete (query as any)[key]
      }
    }

    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        delete (query as any)[k]
      } else {
        ;(query as any)[k] = v
      }
    }
  }
  pagination.page = 1
  void fetchPage()
}

function getDefaultActionButtons(): ButtonConfig[] {
  return [
    {
      label: '编辑',
      size: 'small',
      type: 'primary',
      renderIcon: () => h('span', { class: 'iconify-[mdi--edit]' }),
      onClick: (row?: any) => handleEdit(row),
    },
    {
      label: '删除',
      size: 'small',
      type: 'error',
      renderIcon: () => h('span', { class: 'iconify-[mdi--delete]' }),
      onClick: (row?: any) => handleDelete(row),
    },
  ]
}

function getDefaultHeaderActionButtons(): ButtonConfig[] {
  return [
    {
      label: '新增',
      size: 'small',
      type: 'primary',
      renderIcon: () => h('span', { class: 'iconify-[mdi--add]' }),
      onClick: () => handleCreate(),
    },
  ]
}

const computedActionButtons = computed(() => {
  return props.actionButtons && props.actionButtons.length
    ? props.actionButtons
    : getDefaultActionButtons()
})
const computedHeaderActionButtons = computed(() => {
  return props.headerActionButtons && props.headerActionButtons.length
    ? props.headerActionButtons
    : getDefaultHeaderActionButtons()
})

const actionsColumn: DataTableColumn<any> = {
  title: '操作',
  key: 'actions',
  width: 120,
  align: 'center',
  render(row: any) {
    return h(
      'div',
      { style: { display: 'flex', justifyContent: 'center', gap: '8px' } },
      computedActionButtons.value.map((btn) =>
        h(
          NButton,
          {
            key: btn.label,
            size: (btn.size as any) ?? 'small',
            type: (btn.type as any) ?? undefined,
            onClick: () => btn.onClick && btn.onClick(row),
          },
          {
            icon: () => (btn.renderIcon ? btn.renderIcon() : null),
            default: () => btn.label,
          },
        ),
      ),
    )
  },
}

const tableColumns = computed(() => {
  const base = [...props.columns]
  return props.showActionColumn ? [...base, actionsColumn] : base
})
</script>
