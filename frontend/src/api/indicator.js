import request from '../utils/request';

// 获取指标列表（分页）
export function getIndicators(params) {
  return request({
    url: '/indicators',
    method: 'get',
    params
  });
}

// 获取所有指标（不分页）
export function getAllIndicators(params) {
  return request({
    url: '/indicators/all',
    method: 'get',
    params
  });
}

// 获取指标分类列表
export function getIndicatorCategories() {
  return request({
    url: '/indicators/categories',
    method: 'get'
  });
}

// 获取单个指标详情
export function getIndicatorById(indicatorId) {
  return request({
    url: `/indicators/${indicatorId}`,
    method: 'get'
  });
}

// 创建指标
export function createIndicator(data) {
  return request({
    url: '/indicators',
    method: 'post',
    data
  });
}

// 更新指标
export function updateIndicator(indicatorId, data) {
  return request({
    url: `/indicators/${indicatorId}`,
    method: 'put',
    data
  });
}

// 删除指标
export function deleteIndicator(indicatorId) {
  return request({
    url: `/indicators/${indicatorId}`,
    method: 'delete'
  });
}

// 批量删除指标
export function batchDeleteIndicators(indicatorIds) {
  return request({
    url: '/indicators/batch/delete',
    method: 'post',
    data: { indicatorIds }
  });
}
