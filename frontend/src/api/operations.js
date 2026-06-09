import request from '../utils/request';

/**
 * 运营消息中心 API
 */

// 获取运营消息列表
export function getOperationMessages(params) {
  return request({
    url: '/operations/messages',
    method: 'get',
    params
  });
}

// 获取消息详情
export function getMessageDetail(msgId) {
  return request({
    url: `/operations/messages/${msgId}`,
    method: 'get'
  });
}

// 标记消息为已读
export function markMessageAsRead(msgId) {
  return request({
    url: `/operations/messages/${msgId}/read`,
    method: 'put'
  });
}

// 获取消息设置
export function getMessageSettings(userId) {
  return request({
    url: '/operations/messages/settings',
    method: 'get',
    params: { userId }
  });
}

// 更新消息设置
export function updateMessageSettings(data) {
  return request({
    url: '/operations/messages/settings',
    method: 'put',
    data
  });
}

/**
 * 运维监控 API
 */

// 获取系统监控数据
export function getSystemMonitoring(params) {
  return request({
    url: '/operations/monitoring/system',
    method: 'get',
    params
  });
}

// 获取性能监控数据
export function getPerformanceMonitoring(params) {
  return request({
    url: '/operations/monitoring/performance',
    method: 'get',
    params
  });
}

// 获取系统日志
export function getSystemLogs(params) {
  return request({
    url: '/operations/logs',
    method: 'get',
    params
  });
}

/**
 * 运营系统管理 API
 */

// 获取系统配置
export function getSystemConfig() {
  return request({
    url: '/operations/config',
    method: 'get'
  });
}

// 更新系统配置
export function updateSystemConfig(data) {
  return request({
    url: '/operations/config',
    method: 'put',
    data
  });
}

// 获取用户列表
export function getOperationUsers(params) {
  return request({
    url: '/operations/users',
    method: 'get',
    params
  });
}

// 更新用户权限
export function updateUserPermissions(data) {
  return request({
    url: '/operations/users/permissions',
    method: 'put',
    data
  });
}

// 获取操作日志
export function getOperationLogs(params) {
  return request({
    url: '/operations/operation-logs',
    method: 'get',
    params
  });
}
