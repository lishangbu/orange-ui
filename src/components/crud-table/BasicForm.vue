<script lang="tsx">
import { NForm, NFormItemGi, NGrid, NInput } from 'naive-ui'
import {
  type Component,
  createVNode,
  defineComponent,
  PropType,
  reactive,
  ref,
  resolveDynamicComponent,
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
      validateFields: async (fields?: string[]) => {
        if (!formRef.value) return Promise.resolve()
        // @ts-ignore
        return (formRef.value as any).validateFields?.(fields)
      },
      getModel: () => form,
    })

    function renderNFormItemGi(field: FieldProps) {
      const { path, label, component, componentProps, ...formItemProps } = field

      const key = String(path ?? '')

      // 直接按顶层键读写 form（不支持嵌套点路径）
      const value = form[key]
      const onUpdateValue = (v: any) => {
        form[key] = v
      }

      // 兼容不同组件的 v-model prop 名称：同时提供 value/modelValue 与相应的 update 事件
      const vnodeProps: Record<string, any> = {
        ...(componentProps ?? {}),
        value,
        'onUpdate:value': onUpdateValue,
        modelValue: value,
        'onUpdate:modelValue': onUpdateValue,
      }

      return (
        <NFormItemGi
          label={label}
          path={path}
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
        {...attrs}
        model={form}
      >
        <NGrid {...attrs}>
          {(props.fields ?? []).map((f) => renderNFormItemGi(f as FieldProps))}
        </NGrid>
        <div>{slots.footer ? slots.footer() : null}</div>
      </NForm>
    )
  },
})
</script>
