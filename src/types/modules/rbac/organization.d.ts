/**
 * 组织机构信息
 *
 * @property id 主键，唯一标识组织
 * @property parentId 父组织ID，指向上级组织，顶级组织为 null
 * @property name 组织名称
 * @property code 组织编码（建议字母/数字/下划线，长度 <= 100）
 * @property enabled 组织是否启用，true 表示启用
 * @property remark 备注信息
 * @property sortOrder 排序顺序
 */
export interface Organization {
  id?: number | string
  parentId: number | string | null
  name?: string
  code?: string
  enabled: boolean
  remark?: string
  sortOrder: number
}

/**
 * 组织分页查询参数
 *
 * @property code 组织编码
 * @property name 组织名称
 * @property parentId 父组织ID
 * @property enabled 是否启用
 */
export interface OrganizationQuery extends PageRequest {
  code?: string
  name?: string
  parentId?: number | string
  enabled?: boolean
}

/**
 * 组织机构树节点
 *
 * 用于描述组织机构的树形结构，继承自 Organization 和 TreeNode<Organization>，
 * 既包含组织自身属性，也支持递归嵌套子节点。
 *
 * @property children 子组织节点列表，类型为 OrganizationTreeNode[]，可递归嵌套
 * @example
 * const tree: OrganizationTreeNode = {
 *   id: 1,
 *   name: '集团',
 *   code: 'root',
 *   enabled: true,
 *   sortOrder: 1,
 *   children: [
 *     {
 *       id: 2,
 *       name: '部门A',
 *       code: 'deptA',
 *       enabled: true,
 *       sortOrder: 2,
 *       children: []
 *     }
 *   ]
 * }
 */
export interface OrganizationTreeNode extends  Organization {
  children?: OrganizationTreeNode[]
}
