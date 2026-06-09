import request from '../utils/request';

/**
 * 获取承运人列表
 * @param {Object} params - 查询参数
 * @param {string} params.name - 承运人名称
 * @param {string} params.contact_person - 联系人
 * @param {string} params.status - 状态
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
export function getCarriers(params) {
  return request({
    url: '/carriers',
    method: 'get',
    params
  });
}

/**
 * 获取承运人详情
 * @param {number} carrierId - 承运人ID
 */
export function getCarrierById(carrierId) {
  return request({
    url: `/carriers/${carrierId}`,
    method: 'get'
  });
}

/**
 * 创建承运人
 * @param {Object} data - 承运人数据
 */
export function createCarrier(data) {
  return request({
    url: '/carriers',
    method: 'post',
    data
  });
}

/**
 * 更新承运人
 * @param {number} carrierId - 承运人ID
 * @param {Object} data - 承运人数据
 */
export function updateCarrier(carrierId, data) {
  return request({
    url: `/carriers/${carrierId}`,
    method: 'put',
    data
  });
}

/**
 * 删除承运人
 * @param {number} carrierId - 承运人ID
 */
export function deleteCarrier(carrierId) {
  return request({
    url: `/carriers/${carrierId}`,
    method: 'delete'
  });
}

/**
 * 更新承运人状态
 * @param {number} carrierId - 承运人ID
 * @param {string} status - 状态
 */
export function updateCarrierStatus(carrierId, status) {
  return request({
    url: `/carriers/${carrierId}/status`,
    method: 'patch',
    data: { status }
  });
}

/**
 * 获取承运人统计信息
 * @param {number} carrierId - 承运人ID
 */
export function getCarrierStatistics(carrierId) {
  return request({
    url: `/carriers/${carrierId}/statistics`,
    method: 'get'
  });
}
