import request from '../utils/request';

/**
 * 获取企业消息列表
 * @param {string} companyId - 企业ID
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getMessages(companyId, params = {}) {
  return request({
    url: `/companies/${companyId}/messages`,
    method: 'get',
    params
  });
}

/**
 * 获取消息详情
 * @param {string} companyId - 企业ID
 * @param {string} messageId - 消息ID
 * @returns {Promise}
 */
export function getMessageById(companyId, messageId) {
  return request({
    url: `/companies/${companyId}/messages/${messageId}`,
    method: 'get'
  });
}

/**
 * 标记消息为已读
 * @param {string} companyId - 企业ID
 * @param {string} messageId - 消息ID
 * @returns {Promise}
 */
export function markAsRead(companyId, messageId) {
  return request({
    url: `/companies/${companyId}/messages/${messageId}/read`,
    method: 'put'
  });
}

/**
 * 批量标记消息为已读
 * @param {string} companyId - 企业ID
 * @param {array} messageIds - 消息ID数组
 * @returns {Promise}
 */
export function markMultipleAsRead(companyId, messageIds) {
  return request({
    url: `/companies/${companyId}/messages/batch/read`,
    method: 'put',
    data: { messageIds }
  });
}

/**
 * 标记所有消息为已读
 * @param {string} companyId - 企业ID
 * @returns {Promise}
 */
export function markAllAsRead(companyId) {
  return request({
    url: `/companies/${companyId}/messages/all/read`,
    method: 'put'
  });
}

/**
 * 删除消息
 * @param {string} companyId - 企业ID
 * @param {string} messageId - 消息ID
 * @returns {Promise}
 */
export function deleteMessage(companyId, messageId) {
  return request({
    url: `/companies/${companyId}/messages/${messageId}`,
    method: 'delete'
  });
}

/**
 * 获取消息统计
 * @param {string} companyId - 企业ID
 * @returns {Promise}
 */
export function getMessageStats(companyId) {
  return request({
    url: `/companies/${companyId}/messages-stats`,
    method: 'get'
  });
}

/**
 * 获取消息设置
 * @param {string} companyId - 企业ID
 * @returns {Promise}
 */
export function getMessageSettings(companyId) {
  return request({
    url: `/companies/${companyId}/messages/settings`,
    method: 'get'
  });
}

/**
 * 更新消息设置
 * @param {string} companyId - 企业ID
 * @param {object} settings - 消息设置
 * @returns {Promise}
 */
export function updateMessageSettings(companyId, settings) {
  return request({
    url: `/companies/${companyId}/messages/settings`,
    method: 'put',
    data: settings
  });
}
