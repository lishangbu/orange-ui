import type { Component } from 'vue'
import type { ButtonProps, DataTableColumns, FormItemGiProps, FormItemProps } from 'naive-ui'
import type { InternalRowData } from 'naive-ui/es/data-table/src/interface'

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

export type TableConfig<T = InternalRowData> = {
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
