import { axiosInstance } from '@/utils/request'

import type { Role, RoleQuery } from '@/types/modules/rbac/role'

/**
 * 获取角色分页数据
 *
 * 发起 GET 请求获取角色的分页数据
 *
 * @param query - 角色分页查询参数
 * @returns {Promise<ApiResult<Page<Role>>>} - 后端返回的分页数据
 */
export async function getRolePage(query: RoleQuery): Promise<ApiResult<Page<Role>>> {
  return axiosInstance.request({
    url: '/role/page',
    method: 'GET',
    params: query
  })
}

/**
 * 新增角色
 *
 * 发起 POST 请求新增角色
 *
 * @param {Partial<Role>} data - 新增的角色数据
 * @returns {Promise<ApiResult<Role>>} - 新增后的角色数据
 */
export async function createRole(data: Partial<Role>): Promise<ApiResult<Role>> {
  return axiosInstance.request({
    url: '/role',
    method: 'POST',
    data
  })
}

/**
 * 修改角色
 *
 * 发起 PUT 请求修改角色
 *
 * @param {Partial<Role>} data - 修改的角色数据，需包含主键
 * @returns {Promise<ApiResult<Role>>} - 修改后的角色数据
 */
export async function updateRole(data: Partial<Role>): Promise<ApiResult<Role>> {
  return axiosInstance.request({
    url: '/role',
    method: 'PUT',
    data
  })
}

/**
 * 删除角色
 *
 * 发起 DELETE 请求删除指定角色
 *
 * @param {string} id - 角色唯一标识
 * @returns {Promise<ApiResult<void>>} - 删除操作结果
 */
export async function deleteRole(id: string): Promise<ApiResult<void>> {
  return axiosInstance.request({
    url: `/role/${id}`,
    method: 'DELETE'
  })
}
