import type { Component } from 'vue'
import type { ButtonProps, DataTableColumns, FormItemGiProps, FormItemProps } from 'naive-ui'

/**
 * 字段配置类型
 */
export type FieldConfig = {
  key: string
  label?: string
  formItemProps?: Partial<FormItemProps> & Partial<FormItemGiProps>
  component?: Component
  componentProps?: Record<string, any>
  placeholder?: string
}

export type ButtonConfig = ButtonProps & {
  label: string
}

export type TableConfig<T> = {
  columns: DataTableColumns<T>
  fields?: FieldConfig[]
  searchFields?: FieldConfig[]
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
 * 通用操作弹窗组件属性
 * @prop {boolean} visible - 弹窗显示状态
 * @prop {object} modelValue - 表单数据
 * @prop {'create' | 'edit'} mode - 弹窗模式
 * @prop {boolean} loading - 提交按钮 loading 状态
 * @prop {Array} fields - 表单项配置，包含 label、key、component 等
 */
export type BasicFormModalProps<T = Record<string, any>> = {
  visible: boolean
  modelValue: T | null
  mode: 'create' | 'edit'
  loading?: boolean
  fields: FieldConfig[]
}
