import request from '../utils/request';

/**
 * 获取API文档
 */
export function getApiDocs() {
  return request({
    url: '/docs',
    method: 'get'
  });
}

/**
 * 申请API密钥
 * @param {string} companyId - 企业ID
 * @param {object} data - 密钥信息
 */
export function createApiKey(companyId, data) {
  return request({
    url: `/companies/${companyId}/api-keys`,
    method: 'post',
    data
  });
}

/**
 * 获取企业的API密钥列表
 * @param {string} companyId - 企业ID
 * @param {object} params - 查询参数
 */
export function getApiKeys(companyId, params) {
  return request({
    url: `/companies/${companyId}/api-keys`,
    method: 'get',
    params
  });
}

/**
 * 更新API密钥状态
 * @param {string} companyId - 企业ID
 * @param {string} keyId - 密钥ID
 * @param {object} data - 状态信息
 */
export function updateApiKeyStatus(companyId, keyId, data) {
  return request({
    url: `/companies/${companyId}/api-keys/${keyId}/status`,
    method: 'put',
    data
  });
}

/**
 * 删除API密钥
 * @param {string} companyId - 企业ID
 * @param {string} keyId - 密钥ID
 */
export function deleteApiKey(companyId, keyId) {
  return request({
    url: `/companies/${companyId}/api-keys/${keyId}`,
    method: 'delete'
  });
}

/**
 * API对接测试
 * @param {object} data - 测试数据
 */
export function testApi(data) {
  return request({
    url: '/test',
    method: 'post',
    data
  });
}
