/**
 * 角色信息
 *
 * @property id 角色唯一标识
 * @property code 角色编码
 * @property name 角色名称
 * @property enabled 是否启用
 */
export interface Role {
  code: string
  enabled: boolean
  id: string
  name: string
}

/**
 * 角色分页查询参数
 * @property code 角色编码
 * @property name 角色名称
 * @property enabled 是否启用
 */
export interface RoleQuery extends PageRequest {
  code?: string
  name?: string
  enabled?: boolean
}
