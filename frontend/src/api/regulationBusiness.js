import request from '../utils/request';

/**
 * 获取业务列表
 */
export function getBusinesses(params) {
  return request({
    url: '/regulation/businesses',
    method: 'get',
    params
  });
}

/**
 * 获取业务详情
 */
export function getBusinessById(businessId) {
  return request({
    url: `/regulation/businesses/${businessId}`,
    method: 'get'
  });
}

/**
 * 创建业务
 */
export function createBusiness(data) {
  return request({
    url: '/regulation/businesses',
    method: 'post',
    data
  });
}

/**
 * 更新业务
 */
export function updateBusiness(businessId, data) {
  return request({
    url: `/regulation/businesses/${businessId}`,
    method: 'put',
    data
  });
}

/**
 * 删除业务
 */
export function deleteBusiness(businessId) {
  return request({
    url: `/regulation/businesses/${businessId}`,
    method: 'delete'
  });
}

/**
 * 获取业务统计
 */
export function getBusinessStatistics(params) {
  return request({
    url: '/regulation/businesses/statistics',
    method: 'get',
    params
  });
}
