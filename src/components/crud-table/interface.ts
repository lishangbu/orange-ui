import type { Component } from 'vue'
import type { ButtonProps, FormItemGiProps, FormItemProps } from 'naive-ui'

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
