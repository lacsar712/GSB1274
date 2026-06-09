import request from '../utils/request';

// 获取图数据
export function getGraphData(params) {
  return request({
    url: '/graph',
    method: 'get',
    params
  });
}

// 查询图数据
export function queryGraphData(data) {
  return request({
    url: '/graph/query',
    method: 'post',
    data
  });
}

// 创建节点
export function createNode(data) {
  return request({
    url: '/graph/nodes',
    method: 'post',
    data
  });
}

// 创建边
export function createEdge(data) {
  return request({
    url: '/graph/edges',
    method: 'post',
    data
  });
}

// 获取节点类型列表
export function getNodeTypes() {
  return request({
    url: '/graph/node-types',
    method: 'get'
  });
}

// 获取边标签列表
export function getEdgeLabels() {
  return request({
    url: '/graph/edge-labels',
    method: 'get'
  });
}
