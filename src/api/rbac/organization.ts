import { axiosInstance } from '@/utils/request'
import type {
  Organization,
  OrganizationQuery,
  OrganizationTreeNode,
} from '@/types/modules/rbac/organization'

/**
 * 获取组织分页数据
 *
 * 发起 GET 请求获取组织的分页数据
 *
 * @param parentId - 父组织ID
 * @returns {Promise<Page<Organization>>} - 后端返回的分页数据
 */
export async function getOrganizationPage(query: OrganizationQuery): Promise<ApiResult<Page<OrganizationTreeNode>>> {
  return axiosInstance.request({
    url: '/organization/page',
    method: 'GET',
    params: query
  })
}


/**
 * 获取指定组织及其所有下级组织的树结构
 *
 * 发起 GET 请求，返回指定组织节点及其所有子孙节点的完整树形结构。
 * 常用于组织机构树的递归展示、权限分配等场景。
 *
 * @param {string|number} id - 组织唯一标识（根节点）
 * @returns {Promise<OrganizationTreeNode[]>} - 包含所有下级的组织树节点列表
 * @example
 * // 获取 id=1 的组织及其所有下级
 * const tree = await getOrganizationWithDescendants(1)
 */
export async function getOrganizationWithDescendants(
  id: string | number,
): Promise<ApiResult<OrganizationTreeNode[]>> {
  return axiosInstance.request({
    url: `/organization/tree/descendants/${id}`,
    method: 'GET',
  })
}

/**
 * 获取指定组织信息
 *
 * 发起 GET 请求获取指定组织的信息
 *
 * @param {string|number} id - 组织唯一标识
 * @returns {Promise<Organization>} - 组织信息
 */
export async function getOrganization(id: string | number): Promise<ApiResult<Organization>> {
  return axiosInstance.request({
    url: `/organization/${id}`,
    method: 'GET',
  })
}

/**
 * 新增组织
 *
 * 发起 POST 请求新增组织
 *
 * @param {Partial<Organization>} data - 新增的组织数据
 * @returns {Promise<Organization>} - 新增后的组织数据
 */
export async function createOrganization(
  data: Partial<Organization>,
): Promise<ApiResult<Organization>> {
  return axiosInstance.request({
    url: '/organization',
    method: 'POST',
    data,
  })
}

/**
 * 修改组织
 *
 * 发起 PUT 请求修改组织
 *
 * @param {Partial<Organization>} data - 修改的组织数据，需包含主键
 * @returns {Promise<Organization>} - 修改后的组织数据
 */
export async function updateOrganization(
  data: Partial<Organization>,
): Promise<ApiResult<Organization>> {
  return axiosInstance.request({
    url: '/organization',
    method: 'PUT',
    data,
  })
}

/**
 * 删除组织
 *
 * 发起 DELETE 请求删除指定组织及子组织
 *
 * @param {string|number} id - 组织唯一标识
 * @returns {Promise<void>} - 删除操作结果
 */
export async function removeOrganizationByAncestorId(
  id: string | number,
): Promise<ApiResult<void>> {
  return axiosInstance.request({
    url: `/organization/ancestor/${id}`,
    method: 'DELETE',
  })
}

/**
 * 删除组织
 *
 * 发起 DELETE 请求删除指定组织及子组织
 *
 * @param {string[]} ids - 组织标识列表
 * @returns {Promise<void>} - 删除操作结果
 */
export async function removeOrganizationByAncestorIds(ids: string): Promise<ApiResult<void>> {
  return axiosInstance.request({
    url: `/organization/ancestors/${ids}`,
    method: 'DELETE',
  })
}
