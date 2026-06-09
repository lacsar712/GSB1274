import request from '../utils/request';

/**
 * 获取抽检列表
 */
export function getInspections(params) {
  return request({
    url: '/regulation/inspections',
    method: 'get',
    params
  });
}

/**
 * 获取抽检详情
 */
export function getInspectionById(inspectionId) {
  return request({
    url: `/regulation/inspections/${inspectionId}`,
    method: 'get'
  });
}

/**
 * 创建抽检
 */
export function createInspection(data) {
  return request({
    url: '/regulation/inspections',
    method: 'post',
    data
  });
}

/**
 * 更新抽检
 */
export function updateInspection(inspectionId, data) {
  return request({
    url: `/regulation/inspections/${inspectionId}`,
    method: 'put',
    data
  });
}

/**
 * 删除抽检
 */
export function deleteInspection(inspectionId) {
  return request({
    url: `/regulation/inspections/${inspectionId}`,
    method: 'delete'
  });
}

/**
 * 获取抽检统计
 */
export function getInspectionStatistics(params) {
  return request({
    url: '/regulation/inspections/statistics',
    method: 'get',
    params
  });
}
