/**
 * 通用 API 返回结构
 *
 * @template T 返回数据类型
 * @property code 响应码，通常为 0 表示成功，其他为错误码
 * @property errorMessage 错误信息，成功时为null
 * @property data 返回的数据内容
 */
declare interface ApiResult<T> {
  code: number
  errorMessage: string | null
  data: T
}

/**
 * 分页数据结构
 *
 * @template T 分页记录的数据类型
 * @property current 当前页码
 * @property pages 总页数
 * @property records 当前页的数据列表
 * @property size 每页数据条数
 * @property total 数据总条数
 */
declare interface Page<T> {
  current: string
  pages: string
  records: T[]
  size: string
  total: string
}

/**
 * 分页请求参数
 *
 * @property current 当前页（从 1 开始）
 * @property size 每页数据条数
 */
declare interface PageRequest {
  current?: number
  size?: number
}
