import request from '../utils/request';

/**
 * 获取企业运营概览
 * @param {string} companyId - 企业ID
 * @returns {Promise}
 */
export function getStatisticsOverview(companyId) {
  return request({
    url: `/companies/${companyId}/statistics/overview`,
    method: 'get'
  });
}

/**
 * 获取收入统计数据
 * @param {string} companyId - 企业ID
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.groupBy - 分组方式 (day/week/month)
 * @returns {Promise}
 */
export function getRevenueStatistics(companyId, params) {
  return request({
    url: `/companies/${companyId}/statistics/revenue`,
    method: 'get',
    params
  });
}

/**
 * 导出统计数据
 * @param {string} companyId - 企业ID
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 导出类型 (overview/revenue/all)
 * @returns {Promise}
 */
export function exportStatistics(companyId, params) {
  return request({
    url: `/companies/${companyId}/statistics/export`,
    method: 'get',
    params,
    responseType: 'blob'
  });
}

/**
 * 获取全局运营概览
 * @param {Object} params - 查询参数
 * @param {string} params.companyId - 企业ID（可选）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getOperationsOverview(params) {
  return request({
    url: '/operations/statistics/overview',
    method: 'get',
    params
  });
}

/**
 * 获取全局收入统计
 * @param {Object} params - 查询参数
 * @param {string} params.companyId - 企业ID（可选）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.groupBy - 分组方式 (day/week/month)
 * @returns {Promise}
 */
export function getOperationsRevenue(params) {
  return request({
    url: '/operations/statistics/revenue',
    method: 'get',
    params
  });
}

/**
 * 导出全局运营数据
 * @param {Object} params - 查询参数
 * @param {string} params.companyId - 企业ID（可选）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 导出类型 (overview/revenue/all)
 * @returns {Promise}
 */
export function exportOperationsData(params) {
  return request({
    url: '/operations/statistics/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}
