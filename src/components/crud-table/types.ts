import {
  type DialogProps,
  type FormItemGiProps,
  type FormProps,
  type GridProps,
  type InputNumberProps,
  type InputProps,
  type ModalProps,
  type SelectProps,
  type SwitchProps,
  type TreeSelectProps
} from 'naive-ui'

import type { Component } from 'vue'

/**
 * 单个表单项的配置
 *
 * - `component`：可选，指定渲染该表单项的组件（Vue 组件对象）。
 *
 * - `componentProps`：传给 `component` 的属性，类型支持通用的键值对象以及 Naive UI 常用输入组件的 props 类型。
 *   常见场景包括：
 *   - 基础输入：{ placeholder: '请输入' }
 *   - 选择组件：{ options: [...] }（配合 SelectProps）
 *
 * - 此类型会扩展 `FormItemGiProps`，因此也可以直接在配置里使用 `label`, `path`, `suffix`, `required` 等表单项相关的通用属性。
 */
export type FormItemProps = {
  /** 要渲染的组件，仅接受组件对象（不要使用字符串名称） */
  component?: Component
  /** 传递给组件的 props；可以是任意对象或 Naive UI 中输入类组件的具体 Props 类型 */
  componentProps?:
    | Record<string, any>
    | InputProps
    | InputNumberProps
    | SelectProps
    | SwitchProps
    | TreeSelectProps
} & FormItemGiProps

/**
 * 表单整体配置集合
 *
 * - `formProps`：要透传给表单组件（如 `NForm`）的属性集合，通常包含 `inline`, `labelPlacement`, `labelWidth` 等。
 * - `gridProps`：网格布局（如 `NGrid`）的配置，控制列数、间距、collapsed 等展示行为。
 * - `formItems`：每个表单项的配置（见 `FormItemProps`），用于渲染表单字段。
 */
export type FormOptions = {
  /** 透传给表单容器（NForm）的属性 */
  formProps?: Partial<FormProps>
  /** 网格布局相关属性，用于决定字段的排列方式 */
  gridProps?: Partial<GridProps>
  /** 表单项配置数组，包含组件、label、path 等 */
  formItemProps: FormItemProps[]
}

/**
 * BasicFormModal 的完整选项类型：
 * - 将 Naive UI 的 `ModalProps` 展开为顶层可选字段
 * - 另外强制/补充 `formOptions`（内部 BasicForm 的配置）以及可选的初始 `model`
 */
export type BasicFormDialogModalOptions = Partial<ModalProps> &
  Partial<DialogProps> & {
    /** 内部 BasicForm 的配置 */
    formOptions: FormOptions
    /** 表单初始数据（打开 modal 时用于填充表单） */
    modelValue?: Record<string, unknown>
    /** 控制弹窗显示/隐藏 */
    show?: boolean
  }
