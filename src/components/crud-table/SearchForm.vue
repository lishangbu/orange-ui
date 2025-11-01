<script lang="tsx">
import { type GridProps, NButton, NButtonGroup, NForm, NFormItemGi, NGrid, NInput } from 'naive-ui'
import {
  type Component,
  computed,
  createVNode,
  defineComponent,
  PropType,
  reactive,
  resolveDynamicComponent,
  toRefs,
  watch,
} from 'vue'

import type { FieldProps, SearchFormProps } from './types'

export default defineComponent({
  name: 'SearchForm',
  props: {
    fields: { type: Array as PropType<SearchFormProps['fields']>, default: () => [] },
    loading: { type: Boolean as PropType<SearchFormProps['loading']>, default: false },
    gridProps: {
      type: Object as PropType<SearchFormProps['gridProps']>,
      default: () => {},
    },
    modelValue: { type: Object as PropType<SearchFormProps['modelValue']>, default: () => {} },
  },
  emits: ['search', 'update:modelValue', 'update:gridProps'],
  setup<T = Record<string, any>>(props: Readonly<SearchFormProps<T>>, { emit }) {
    const { fields, loading } = toRefs(props)

    // 模型代理：从 props.modelValue 读取，写入时通过 emit('update:modelValue', ...) 回传给父组件
    const modelProxy = computed<T>({
      get: () => (props.modelValue ?? ({} as T)) as T,
      set: (v: T) => {
        emit('update:modelValue', { ...(v ?? ({} as T)) })
      },
    })

    // 本地响应式表单状态（可变）
    const form = reactive<T>({ ...(modelProxy.value ?? {}) })

    // 当父级 model 变化时，同步到本地表单（保持引用不变）
    watch(
      () => modelProxy.value,
      (next) => {
        // 先删除现有键再赋值，以保持相同的响应式对象引用
        Object.keys(form).forEach((k) => delete (form as any)[k])
        Object.assign(form, next ?? {})
      },
      { immediate: true, deep: true },
    )

    // 确保 fields 中声明的键在 form 中存在（避免 undefined）
    watch(
      () => fields.value,
      (list) => {
        const keys = (list ?? []).map((f: any) => f.path).filter(Boolean)
        for (const k of keys) {
          if (!(k in form)) (form as any)[k] = ''
        }
        // 删除不再存在的键
        for (const k of Object.keys(form)) {
          if (!keys.includes(k)) delete (form as any)[k]
        }
      },
      { immediate: true, deep: true },
    )

    // Grid 配置
    const defaultGrid: Partial<GridProps> & { collapsed?: boolean; collapsedRows?: number } = {
      cols: 2,
      xGap: 8,
      yGap: 4,
      collapsedRows: 1,
      collapsed: true,
    }
    // collapsed 为计算属性，作为折叠状态的单一数据源：优先读取 props.gridProps.collapsed，否则使用默认值
    const collapsed = computed<boolean>({
      get() {
        const gp = (props.gridProps as Partial<GridProps>) ?? {}
        if (gp && 'collapsed' in gp) return Boolean((gp as any).collapsed)
        return Boolean(defaultGrid.collapsed)
      },
      set(v: boolean) {
        const currentGp = (props.gridProps as GridProps) ?? {}
        const full: GridProps = { ...currentGp, collapsed: v }
        emit('update:gridProps', full)
      },
    })

    const gridProps = computed(() => {
      const gp = (props.gridProps as Partial<GridProps>) ?? {}
      return {
        ...defaultGrid,
        ...gp,
        // 以 collapsed 的计算值为准
        collapsed: collapsed.value,
      } as GridProps
    })

    const isCollapsed = computed(() => !!gridProps.value.collapsed)
    function toggleExpand() {
      // 通过计算属性的 setter 翻转 collapsed（setter 会 emit update:gridProps）
      collapsed.value = !collapsed.value
    }

    // 仅当字段数量 >= 列数时显示展开/收起开关
    const showToggle = computed(() => {
      const count = (fields?.value ?? []).length
      const cols = (gridProps.value?.cols ?? defaultGrid.cols) as number
      return count >= (cols ?? 1)
    })

    // 事件处理函数
    function handleSearch(): T {
      return { ...form }
    }
    function handleReset(): T {
      for (const value of Object.keys(form)) (form as T)[path] = ''
      return { ...(form as T) }
    }
    function onSearch() {
      emit('search', handleSearch())
    }
    function onReset() {
      emit('search', handleReset())
    }
    // 将本地表单变更回传给父组件的 model
    watch(
      () => form,
      (v) => emit('update:modelValue', { ...(v as T) }),
      { deep: true },
    )

    // 渲染辅助函数

    function renderNFormItemGi(field: FieldProps) {
      const { path, label, component, componentProps, ...formItemProps } = field
      const value = (form as any)[path]
      const onUpdate = (v: any) => {
        ;(form as any)[path] = v
      }
      const compProps: Record<string, any> = {
        value,
        ...(componentProps ?? {}),
      }

      return (
        <NFormItemGi
          label={label}
          path={path}
          {...(formItemProps ?? {})}
        >
          {createVNode(
            resolveDynamicComponent((component as Component) ?? NInput) as Component,
            compProps,
          )}
        </NFormItemGi>
      )
    }

    return () => (
      <NForm
        inline
        model={form}
        class='mb-0 flex-1'
        onKeyup={(e: KeyboardEvent) => {
          if (e.key === 'Enter') onSearch()
        }}
      >
        <NGrid {...(gridProps.value as GridProps)}>
          {fields?.value?.map((field: FieldProps) => renderNFormItemGi(field))}

          <NFormItemGi suffix>
            <NButtonGroup size='small'>
              <NButton
                onClick={onReset}
                disabled={loading?.value}
                renderIcon={() => <span class='icon-[mdi--clear]' />}
              >
                重置
              </NButton>
              <NButton
                type='primary'
                loading={loading?.value}
                onClick={onSearch}
                renderIcon={() => <span class='icon-[mdi--search]' />}
              >
                查询
              </NButton>
              {showToggle.value && (
                <NButton
                  text
                  onClick={toggleExpand}
                  renderIcon={() => (
                    <span
                      class={
                        isCollapsed.value
                          ? 'icon-[mdi--arrow-expand]'
                          : 'icon-[mdi--arrow-collapse]'
                      }
                    />
                  )}
                >
                  {isCollapsed.value ? '展开' : '收起'}
                </NButton>
              )}
            </NButtonGroup>
          </NFormItemGi>
        </NGrid>
      </NForm>
    )
  },
})
</script>
