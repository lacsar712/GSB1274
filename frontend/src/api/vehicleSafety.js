import request from '../utils/request';

// 创建车辆安全记录
export function createSafetyRecord(data) {
  return request({
    url: '/vehicle-safety',
    method: 'post',
    data
  });
}

// 获取车辆安全记录列表
export function getSafetyRecords(params) {
  return request({
    url: '/vehicle-safety',
    method: 'get',
    params
  });
}

// 获取车辆安全记录详情
export function getSafetyRecordById(id) {
  return request({
    url: `/vehicle-safety/${id}`,
    method: 'get'
  });
}

// 更新车辆安全记录
export function updateSafetyRecord(id, data) {
  return request({
    url: `/vehicle-safety/${id}`,
    method: 'put',
    data
  });
}

// 更新处理状态
export function updateSafetyStatus(id, data) {
  return request({
    url: `/vehicle-safety/${id}/status`,
    method: 'put',
    data
  });
}

// 删除车辆安全记录
export function deleteSafetyRecord(id) {
  return request({
    url: `/vehicle-safety/${id}`,
    method: 'delete'
  });
}

// 获取车辆安全统计数据
export function getSafetyStatistics(params) {
  return request({
    url: '/vehicle-safety/statistics',
    method: 'get',
    params
  });
}

// 获取事件类型分布
export function getEventTypeDistribution(params) {
  return request({
    url: '/vehicle-safety/event-distribution',
    method: 'get',
    params
  });
}

// 获取趋势数据
export function getSafetyTrend(params) {
  return request({
    url: '/vehicle-safety/trend',
    method: 'get',
    params
  });
}

// 获取车辆实时位置
export function getVehicleLocations(params) {
  return request({
    url: '/vehicle-safety/locations',
    method: 'get',
    params
  });
}

// 获取高风险车辆列表
export function getHighRiskVehicles(params) {
  return request({
    url: '/vehicle-safety/high-risk',
    method: 'get',
    params
  });
}

// 获取未处理预警列表
export function getSafetyAlerts(params) {
  return request({
    url: '/vehicle-safety/alerts',
    method: 'get',
    params
  });
}

// 标记预警为已处理
export function handleSafetyAlert(id) {
  return request({
    url: `/vehicle-safety/alerts/${id}/handle`,
    method: 'put'
  });
}
