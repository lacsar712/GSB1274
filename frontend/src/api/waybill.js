import request from '../utils/request';

/**
 * 获取企业运单列表
 * @param {string} companyId - 企业ID
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getWaybillList(companyId, params) {
  return request({
    url: `/companies/${companyId}/waybills`,
    method: 'get',
    params
  });
}

/**
 * 获取运单详情
 * @param {string} companyId - 企业ID
 * @param {string} waybillId - 运单ID
 * @returns {Promise}
 */
export function getWaybillDetail(companyId, waybillId) {
  return request({
    url: `/companies/${companyId}/waybills/${waybillId}`,
    method: 'get'
  });
}

/**
 * 创建运单
 * @param {string} companyId - 企业ID
 * @param {object} data - 运单数据
 * @returns {Promise}
 */
export function createWaybill(companyId, data) {
  return request({
    url: `/companies/${companyId}/waybills`,
    method: 'post',
    data
  });
}

/**
 * 更新运单
 * @param {string} companyId - 企业ID
 * @param {string} waybillId - 运单ID
 * @param {object} data - 更新数据
 * @returns {Promise}
 */
export function updateWaybill(companyId, waybillId, data) {
  return request({
    url: `/companies/${companyId}/waybills/${waybillId}`,
    method: 'put',
    data
  });
}

/**
 * 更新运单状态
 * @param {string} companyId - 企业ID
 * @param {string} waybillId - 运单ID
 * @param {object} data - 状态数据
 * @returns {Promise}
 */
export function updateWaybillStatus(companyId, waybillId, data) {
  return request({
    url: `/companies/${companyId}/waybills/${waybillId}/status`,
    method: 'patch',
    data
  });
}

/**
 * 添加运单轨迹
 * @param {string} companyId - 企业ID
 * @param {string} waybillId - 运单ID
 * @param {object} data - 轨迹数据
 * @returns {Promise}
 */
export function addWaybillTrack(companyId, waybillId, data) {
  return request({
    url: `/companies/${companyId}/waybills/${waybillId}/tracks`,
    method: 'post',
    data
  });
}

/**
 * 删除运单
 * @param {string} companyId - 企业ID
 * @param {string} waybillId - 运单ID
 * @returns {Promise}
 */
export function deleteWaybill(companyId, waybillId) {
  return request({
    url: `/companies/${companyId}/waybills/${waybillId}`,
    method: 'delete'
  });
}

/**
 * 获取运单统计
 * @param {string} companyId - 企业ID
 * @returns {Promise}
 */
export function getWaybillStats(companyId) {
  return request({
    url: `/companies/${companyId}/waybills-stats`,
    method: 'get'
  });
}
