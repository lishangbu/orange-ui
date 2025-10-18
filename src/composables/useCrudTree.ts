import { onMounted, ref, watch } from 'vue'

interface CrudTreeOptions<T> {
  fetchTreeDataFn?: () => Promise<T[]>
  keyField?: string
  labelField?: string
  childrenField?: string
}

export function useCrudTree<T extends Record<string, any>>(options: CrudTreeOptions<T>) {
  const keyField = options.keyField || 'key'
  const labelField = options.labelField || 'label'
  const childrenField = options.childrenField || 'children'

  const treeData = ref<T[]>([])
  const originalTreeData = ref<T[]>([])
  const checkedKeys = ref<(string | number)[]>([])
  const searchValue = ref('')
  const loading = ref(false)

  async function fetchTreeData() {
    if (!options.fetchTreeDataFn) return
    loading.value = true
    try {
      const data = await options.fetchTreeDataFn()
      originalTreeData.value = data || []
      treeData.value = data || []
    } finally {
      loading.value = false
    }
  }

  function filterTreeByName(nodes: T[], keyword: string): T[] {
    if (!keyword) return nodes
    const result: T[] = []
    for (const node of nodes) {
      const children = node[childrenField] ? filterTreeByName(node[childrenField], keyword) : []
      if (String(node[labelField]).includes(keyword) || children.length > 0) {
        result.push({ ...node, [childrenField]: children })
      }
    }
    return result
  }

  watch(searchValue, (val) => {
    treeData.value = filterTreeByName(originalTreeData.value, val.trim())
  })

  onMounted(() => {
    if (options.fetchTreeDataFn) fetchTreeData()
  })

  function handleRefresh() {
    treeData.value=[]
    originalTreeData.value=[]
    checkedKeys.value=[]
    searchValue.value=''
    fetchTreeData()
  }

  return {
    keyField,
    labelField,
    childrenField,
    treeData,
    originalTreeData,
    checkedKeys,
    searchValue,
    loading,
    fetchTreeDataFn: options.fetchTreeDataFn,
    fetchTreeData,
    filterTreeByName,
    handleRefresh,
  }
}
