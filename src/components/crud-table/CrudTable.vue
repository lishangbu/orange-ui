<script lang="ts" setup>
import { debounce, throttle } from 'lodash-es'
import {
  type DataTableColumn,
  NButton,
  NDataTable,
  type PaginationProps,
  useDialog,
  useMessage,
} from 'naive-ui'
import { type Component, computed, h, onBeforeUnmount, reactive, ref, useAttrs } from 'vue'

import CrudFormActionModal from './CrudFormActionModal.vue'
import SearchForm from './SearchForm.vue'

import type { FieldConfig } from '@/components'

const message = useMessage()
const dialog = useDialog()
const attrs = useAttrs()
/**
 * 通用 CRUD 表格组件
 * props:
 *  - columns, fields, searchFields
 *  - page/create/update/remove: API functions passed from parent
 */
const props = defineProps<{
  columns: Array<DataTableColumn>
  fields: FieldConfig[]
  searchFields?: {
    label: string
    key: string
    component?: string | Component
    props?: Record<string, any>
    placeholder?: string
  }[]
  page: (params: any) => Promise<any>
  create?: (data: any) => Promise<any>
  update?: (data: any) => Promise<any>
  remove?: (id: string | number) => Promise<any>
}>()

const data = ref<any[]>([])
const loading = ref(false)
const query = reactive<Record<string, any>>({})

const pagination = reactive<PaginationProps>({
  page: 1, //受控模式下的当前页
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
    throttledFetchPage()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    throttledFetchPage()
  },
})

function fetchPage() {
  if (!props.page) return
  loading.value = true
  const current = (pagination.page as number) ?? 1
  const size = (pagination.pageSize as number) ?? 10
  props
    .page({
      current,
      size,
      ...query,
    })
    .then((res) => {
      data.value = res?.data?.records ?? []
      pagination.pageCount = Number(res?.data?.pages) ?? 0
      pagination.itemCount = Number(res?.data?.total) ?? 0
    })
    .finally(() => (loading.value = false))
}

// 使用 throttle 来限制 fetchPage 的调用频率（分页切换时）
const throttledFetchPage = throttle(() => {
  void fetchPage()
}, 300)

// 使用 debounce 来防抖搜索（避免用户连续输入触发大量请求）
const debouncedSearch = debounce((searchParams: Record<string, any>) => {
  const params = searchParams ?? {}

  // 如果没有任何搜索条件，清空 query
  if (!params || Object.keys(params).length === 0) {
    for (const key of Object.keys(query)) {
      delete (query as any)[key]
    }
  } else {
    // 删除之前存在但本次未提交的条件
    for (const key of Object.keys(query)) {
      if (!(key in params)) {
        delete (query as any)[key]
      }
    }

    // 将新条件写入 query；对于空字符串、null 或 undefined 的值，视为清除该条件
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
}, 300)

function doCreate(item: Partial<any>) {
  if (!props.create) return
  props.create(item).then(() => message.success('新增成功'))
}

function doUpdate(item: Partial<any>) {
  if (!props.update) return
  props.update(item).then(() => message.success('更新成功'))
}

function doRemove(id: string | number) {
  if (!props.remove) return
  props.remove(id).then(() => message.success('删除成功'))
}

// initial load
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
    onPositiveClick: () => {
      doRemove(row.id)
      throttledFetchPage()
    },
  })
}

function handleModalSubmit(payload: any) {
  modalLoading.value = true
  const action = modalMode.value === 'create' ? doCreate : doUpdate
  action(payload)
  modalVisible.value = false
  throttledFetchPage()
}

function handleSearch(searchParams: Record<string, any>) {
  // 使用 debouncedSearch 防抖处理
  debouncedSearch(searchParams)
}

const actionsColumn: DataTableColumn<any> = {
  title: '操作',
  key: 'actions',
  width: 120,
  align: 'center',
  render(row: any) {
    return h('div', { style: 'display: flex; justify-content: center; gap: 8px;' }, [
      h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          class: 'ml-2',
          onClick: () => handleEdit(row),
        },
        { default: () => '编辑' },
      ),
      h(
        NButton,
        {
          size: 'small',
          type: 'error',
          class: 'ml-2',
          onClick: () => handleDelete(row),
        },
        { default: () => '删除' },
      ),
    ])
  },
}

const tableColumns = computed(() => [...props.columns, actionsColumn])

// 组件卸载时清理 debounce/throttle 的计时器，避免内存泄漏或卸载后调用
onBeforeUnmount(() => {
  debouncedSearch.cancel()
  throttledFetchPage.cancel()
})
</script>

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
      <NButton
        type="primary"
        size="small"
        @click="handleCreate"
        >新增</NButton
      >
      <span
        @click="showSearchForm = !showSearchForm"
        class="iconify-[ic--baseline-search] cursor-pointer text-xl transition-colors duration-200"
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

    <CrudFormActionModal
      v-model:visible="modalVisible"
      :model-value="currentRow"
      :mode="modalMode"
      :loading="modalLoading"
      :fields="fields"
      @submit="handleModalSubmit"
    />
  </div>
</template>
