<script lang="tsx">
import { NButton, NModal } from 'naive-ui'
import { computed, defineComponent, ref, watch, nextTick } from 'vue'

import BasicForm from './BasicForm.vue'

import type { BasicFormModalProps, ButtonConfig } from './types'
import type { FormInst } from 'naive-ui/es/form/src/interface'

export default defineComponent({
  name: 'BasicFormModal',
  props: {
    visible: { type: Boolean as () => BasicFormModalProps['visible'], required: true },
    mode: { type: String as () => BasicFormModalProps['mode'], required: true },
    loading: { type: Boolean as () => BasicFormModalProps['loading'], default: false },
    fields: { type: Array as any as () => BasicFormModalProps['fields'], default: () => [] },
  },
  emits: ['update:visible', 'submit'],
  setup(props: Readonly<BasicFormModalProps>, { emit, expose }) {
    // BasicForm ref, 用于调用 validate 和获取内部 model
    const basicFormRef = ref<FormInst | null>(null)

    // 缓存传入的 model，当 BasicForm 尚未挂载时先保存，等待 modal 打开/组件挂载后应用
    let pendingModel: Record<string, any> | undefined = undefined

    function handleClose() {
      emit('update:visible', false)
    }

    async function handleSubmit() {
      // 尝试触发验证
      try {
        await (basicFormRef.value as FormInst)?.validate?.()
      } catch (e) {
        console.error('validation failed', e)
        // 验证失败，阻止提交
        return
      }

      // 从 BasicForm 暴露的 getModel 中获取当前数据并提交
      const model = (basicFormRef.value as any)?.getModel?.() ?? {}
      emit('submit', { ...(model ?? {}) })
    }

    const title = computed(() => (props.mode === 'create' ? '新增' : '编辑'))
    const confirmButtonLabel = computed(() => (props.mode === 'create' ? '确认新增' : '确认修改'))
    const cancelButtonLabel = computed(() => (props.mode === 'create' ? '取消新增' : '取消修改'))

    const basicFormButtons = computed<ButtonConfig[]>(() => [
      {
        label: cancelButtonLabel.value,
        type: 'error',
        onClick: () => handleClose(),
      },
      {
        label: confirmButtonLabel.value,
        type: 'primary',
        loading: props.loading,
        onClick: () => handleSubmit(),
      },
    ])

    // 暴露 setModel 方法，让父组件在打开 modal 前调用以设置初始数据
    function applyToInner(v: Record<string, any> | undefined) {
      if (!basicFormRef.value) return false
      // 从 basicFormRef 获取内部 model（reactive 对象），并原地替换其键值
      // @ts-ignore
      const inner = (basicFormRef.value as any)?.getModel?.()
      if (!inner) return false
      // 清空已有键
      for (const k of Object.keys(inner)) delete inner[k]
      // 赋值新键
      if (v && typeof v === 'object') Object.assign(inner, v)
      return true
    }

    function setModel(v: Record<string, any> | undefined) {
      // 如果可以立即应用，直接应用；否则缓存到 pendingModel，等 modal 打开/组件挂载后应用
      const applied = applyToInner(v)
      if (!applied) pendingModel = v
    }

    // 当 modal 打开时（父组件通常先调用 setModel 然后把 visible 设为 true），尝试在 nextTick 应用 pendingModel。
    // 由于 NModal 可能延迟挂载子组件（teleport/动画），我们做多次 retry 来提高成功率。
    watch(
      () => props.visible,
      async (val) => {
        if (!val || pendingModel === undefined) return
        const maxAttempts = 5
        for (let i = 0; i < maxAttempts; i++) {
          await nextTick()
          if (applyToInner(pendingModel)) {
            pendingModel = undefined
            break
          }
        }
      },
    )

    // 另外，当 basicFormRef 从 null 变为可用时也尝试应用 pendingModel
    watch(
      () => basicFormRef.value,
      async (refVal) => {
        if (!refVal || pendingModel === undefined) return
        await nextTick()
        if (applyToInner(pendingModel)) pendingModel = undefined
      },
    )

    expose({ setModel })

    return () => (
      <NModal
        show={props.visible}
        preset='card'
        title={title.value}
        onClose={handleClose}
        class='w-full max-w-md'
      >
        <BasicForm
          ref={basicFormRef}
          fields={props.fields}
          cols="1"
          label-placement='left'
          label-width='auto'
        >
          {{
            footer: () => (
              <div class='flex items-center justify-end gap-2'>
                {basicFormButtons.value.map((btn) => (
                  <NButton
                    key={btn.label}
                    type={btn.type}
                    onClick={btn.onClick}
                  >
                    {btn.label}
                  </NButton>
                ))}
              </div>
            ),
          }}
        </BasicForm>
      </NModal>
    )
  },
})
</script>
