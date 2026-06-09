import request from '../utils/request';

/**
 * 获取监管运单列表
 */
export function getRegulationWaybills(params) {
  return request({
    url: '/regulation/waybills',
    method: 'get',
    params
  });
}

/**
 * 获取监管运单详情
 */
export function getRegulationWaybillById(waybillId) {
  return request({
    url: `/regulation/waybills/${waybillId}`,
    method: 'get'
  });
}

/**
 * 更新监管运单
 */
export function updateRegulationWaybill(waybillId, data) {
  return request({
    url: `/regulation/waybills/${waybillId}`,
    method: 'put',
    data
  });
}

/**
 * 获取监管运单统计
 */
export function getRegulationWaybillStatistics(params) {
  return request({
    url: '/regulation/waybills/statistics',
    method: 'get',
    params
  });
}
