import {
  type ButtonProps,
  type DataTableColumns,
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
 * 字段配置类型
 */
export type FieldProps = {
  component?: Component
  componentProps?:
    | Record<string, any>
    | InputProps
    | InputNumberProps
    | SelectProps
    | SwitchProps
    | TreeSelectProps
} & FormItemGiProps

export type ButtonConfig = ButtonProps & {
  label: string
}

export type TableConfig<T = Record<string, any>> = {
  columns: DataTableColumns<T>
  fields?: FieldProps[]
  searchGridProps?: Partial<GridProps>
  searchFields?: Partial<FieldProps>
  page: (params: any) => Promise<any>
  create?: (data: any) => Promise<any>
  update?: (data: any) => Promise<any>
  remove?: (id: string | number) => Promise<any>
  actionButtons?: ButtonConfig[]
  showActionColumn?: boolean
  showHeaderAction?: boolean
  headerActionButtons?: ButtonConfig[]
}

/**
 * 基础表单组件属性
 * @prop {Array<FieldProps>} fields - 表单字段配置数组，按顺序渲染
 */
export type BasicFormProps<T = Record<string, any>> = {
  fields?: FieldProps[]
} & FormProps & Partial<GridProps>

/**
 * 通用操作弹窗组件属性
 * @prop {boolean} visible - 弹窗显示状态
 * @prop {'create' | 'edit'} mode - 弹窗模式
 * @prop {boolean} loading - 提交按钮 loading 状态
 * @prop {Array} fields - 表单项配置，包含 label、key、component 等
 */
export type BasicFormModalProps = {
  visible: boolean
  mode: 'create' | 'edit'
  loading?: boolean
} & BasicFormProps &
  ModalProps

/**
 * 搜索表单组件属性
 * @prop {Array<FieldProps>} fields - 表单字段配置数组，按顺序渲染
 * @prop {boolean} [loading=false] - 查询按钮 loading 状态，true 时按钮不可交互显示 loading
 */
export type SearchFormProps = {
  loading?: boolean
} & BasicFormProps
