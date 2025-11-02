<script lang="tsx">
import { NForm, NFormItemGi, NGrid, NInput } from 'naive-ui'
import {
  type Component,
  createVNode,
  defineComponent,
  type PropType,
  reactive,
  ref,
  resolveDynamicComponent,
  computed,
} from 'vue'

import type { BasicFormProps, FieldProps } from './types'
import type { FormInst } from 'naive-ui/es/form/src/interface'

export default defineComponent({
  name: 'BasicForm',
  // 只声明 fields 为明确的 prop，其他 FormProps/Partial<GridProps] 将作为 attrs 透传
  props: {
    fields: { type: Array as PropType<BasicFormProps['fields']>, default: () => [] },
  },
  setup(props: Readonly<BasicFormProps>, { slots, attrs, expose }) {
    // 本地可变表单对象，保持引用稳定
    const form = reactive<Record<string, any>>({})

    // 内部 NForm 引用，用于 expose 方法
    const formRef = ref<FormInst | null>(null)

    // 将内部 NForm 的方法暴露给父组件
    expose({
      validate: async (...args: any[]) => {
        if (!formRef.value) return Promise.resolve()
        // @ts-ignore
        return (formRef.value as any).validate?.(...args)
      },
      // BasicFormModal 依赖 getModel 获取内部 reactive model
      getModel: () => form,
    })

    // 从运行时组件 props 中提取 prop key 集合（保留 any 转换以兼容不同 naive-ui 版本）
    const gridPropKeys = new Set<string>(Object.keys((NGrid as any).props ?? {}))
    const formPropKeys = new Set<string>(Object.keys((NForm as any).props ?? {}))
    const formItemGiPropKeys = new Set<string>(Object.keys((NFormItemGi as any).props ?? {}))

    // 将 attrs 拆分为不同组件的 attrs，按优先级避免冲突：form > grid > formItemGi
    // 使用 computed 保证当父组件 attrs 变化时这里会自动更新
    const parsedAttrs = computed(() => {
      const formAttrs: Record<string, any> = {}
      const gridAttrs: Record<string, any> = {}
      const formItemGiAttrs: Record<string, any> = {}

      for (const [k, v] of Object.entries(attrs ?? {})) {
        if (formPropKeys.has(k)) {
          formAttrs[k] = v
          console.debug('formAttr', k, v)
        } else if (gridPropKeys.has(k)) {
          gridAttrs[k] = v
          console.debug('gridAttr', k, v)
        } else if (formItemGiPropKeys.has(k)) {
          formItemGiAttrs[k] = v
          console.debug('formItemGiAttr', k, v)
        }
      }

      return { formAttrs, gridAttrs, formItemGiAttrs }
    })

    function renderNFormItemGi(field: FieldProps) {
      const { path, label, component, componentProps, ...formItemProps } = field

      // 只使用 path 作为字段标识（不再使用 field.key）
      if (!path) {
        console.warn('BasicForm: field missing "path", skipping render', field)
        return null
      }
      const key = String(path)

      // 直接按顶层键读写 form（不支持嵌套点路径）
      const value = form[key]
      const onUpdateValue = (v: any) => {
        form[key] = v
      }

      // 兼容不同组件的 v-model prop 名称：仅提供 value 与 onUpdate:value
      // （根据最新要求完全移除 modelValue 支持）
      const vnodeProps: Record<string, any> = {
        ...(componentProps ?? {}),
        value,
        'onUpdate:value': onUpdateValue,
      }

      return (
        <NFormItemGi
          key={key}
          label={label}
          path={key}
          {...(parsedAttrs.value.formItemGiAttrs ?? {})}
          {...(formItemProps ?? {})}
        >
          {createVNode(
            resolveDynamicComponent((component as Component) ?? NInput) as Component,
            vnodeProps,
          )}
        </NFormItemGi>
      )
    }

    return () => (
      <NForm
        ref={formRef}
        {...parsedAttrs.value.formAttrs}
        model={form}
      >
        <NGrid {...parsedAttrs.value.gridAttrs}>
          {(props.fields ?? []).map((f) => renderNFormItemGi(f as FieldProps))}
          {slots.suffix ? slots.suffix() : null}
        </NGrid>
        <div>{slots.footer ? slots.footer() : null}</div>
      </NForm>
    )
  },
})
</script>
