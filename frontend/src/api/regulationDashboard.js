import request from '../utils/request';

/**
 * 获取大屏数据
 */
export function getDashboardData(params) {
  return request({
    url: '/regulation/dashboard',
    method: 'get',
    params
  });
}

/**
 * 获取大屏配置
 */
export function getDashboardConfig(params) {
  return request({
    url: '/regulation/dashboard/config',
    method: 'get',
    params
  });
}

/**
 * 更新大屏配置
 */
export function updateDashboardConfig(data) {
  return request({
    url: '/regulation/dashboard/config',
    method: 'put',
    data
  });
}
