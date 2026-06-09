import request from '../utils/request';

// 获取风险列表（分页）
export function getRisks(params) {
  return request({
    url: '/risks',
    method: 'get',
    params
  });
}

// 获取风险分类列表
export function getRiskCategories() {
  return request({
    url: '/risks/categories',
    method: 'get'
  });
}

// 获取风险统计
export function getRiskStatistics() {
  return request({
    url: '/risks/statistics',
    method: 'get'
  });
}

// 获取单个风险详情
export function getRiskById(riskId) {
  return request({
    url: `/risks/${riskId}`,
    method: 'get'
  });
}

// 创建风险
export function createRisk(data) {
  return request({
    url: '/risks',
    method: 'post',
    data
  });
}

// 更新风险
export function updateRisk(riskId, data) {
  return request({
    url: `/risks/${riskId}`,
    method: 'put',
    data
  });
}

// 删除风险
export function deleteRisk(riskId) {
  return request({
    url: `/risks/${riskId}`,
    method: 'delete'
  });
}

// 批量删除风险
export function batchDeleteRisks(riskIds) {
  return request({
    url: '/risks/batch/delete',
    method: 'post',
    data: { riskIds }
  });
}
