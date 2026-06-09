import request from '../utils/request';

// 创建配送订单
export function createDelivery(data) {
  return request({
    url: '/deliveries',
    method: 'post',
    data
  });
}

// 获取配送订单列表
export function getDeliveries(params) {
  return request({
    url: '/deliveries',
    method: 'get',
    params
  });
}

// 获取配送订单详情
export function getDeliveryById(id) {
  return request({
    url: `/deliveries/${id}`,
    method: 'get'
  });
}

// 根据订单号获取配送订单
export function getDeliveryByOrderNo(orderNo) {
  return request({
    url: `/deliveries/order/${orderNo}`,
    method: 'get'
  });
}

// 更新配送订单
export function updateDelivery(id, data) {
  return request({
    url: `/deliveries/${id}`,
    method: 'put',
    data
  });
}

// 更新配送状态
export function updateDeliveryStatus(id, status) {
  return request({
    url: `/deliveries/${id}/status`,
    method: 'put',
    data: { status }
  });
}

// 分配配送员
export function assignDriver(id, data) {
  return request({
    url: `/deliveries/${id}/assign`,
    method: 'put',
    data
  });
}

// 删除配送订单
export function deleteDelivery(id) {
  return request({
    url: `/deliveries/${id}`,
    method: 'delete'
  });
}

// 获取配送统计数据
export function getDeliveryStatistics(params) {
  return request({
    url: '/deliveries/statistics',
    method: 'get',
    params
  });
}

// 获取配送趋势数据
export function getDeliveryTrend(params) {
  return request({
    url: '/deliveries/trend',
    method: 'get',
    params
  });
}

// 获取配送员绩效数据
export function getDriverPerformance(params) {
  return request({
    url: '/deliveries/driver-performance',
    method: 'get',
    params
  });
}

// 获取配送轨迹
export function getDeliveryTracks(id) {
  return request({
    url: `/deliveries/${id}/tracks`,
    method: 'get'
  });
}

// 新增配送轨迹
export function addDeliveryTrack(id, data) {
  return request({
    url: `/deliveries/${id}/tracks`,
    method: 'post',
    data
  });
}

// 获取配送评价
export function getDeliveryRatings(id) {
  return request({
    url: `/deliveries/${id}/ratings`,
    method: 'get'
  });
}

// 新增配送评价
export function addDeliveryRating(id, data) {
  return request({
    url: `/deliveries/${id}/ratings`,
    method: 'post',
    data
  });
}
