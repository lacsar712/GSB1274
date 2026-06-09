import request from '../utils/request';

// 获取标签列表（分页）
export function getTags(params) {
  return request({
    url: '/tags',
    method: 'get',
    params
  });
}

// 获取所有标签（不分页，用于标签云）
export function getAllTags() {
  return request({
    url: '/tags/all',
    method: 'get'
  });
}

// 获取单个标签详情
export function getTagById(tagId) {
  return request({
    url: `/tags/${tagId}`,
    method: 'get'
  });
}

// 创建标签
export function createTag(data) {
  return request({
    url: '/tags',
    method: 'post',
    data
  });
}

// 更新标签
export function updateTag(tagId, data) {
  return request({
    url: `/tags/${tagId}`,
    method: 'put',
    data
  });
}

// 删除标签
export function deleteTag(tagId) {
  return request({
    url: `/tags/${tagId}`,
    method: 'delete'
  });
}

// 批量删除标签
export function batchDeleteTags(tagIds) {
  return request({
    url: '/tags/batch/delete',
    method: 'post',
    data: { tagIds }
  });
}

// 增加标签使用次数
export function incrementUsageCount(tagId) {
  return request({
    url: `/tags/${tagId}/increment`,
    method: 'post'
  });
}

// 减少标签使用次数
export function decrementUsageCount(tagId) {
  return request({
    url: `/tags/${tagId}/decrement`,
    method: 'post'
  });
}
