import request from '../utils/request';

// 获取企业配置列表
export function getCompanyConfigs(params) {
  return request({
    url: '/company-configs',
    method: 'get',
    params
  });
}

// 获取企业配置详情
export function getCompanyConfigById(configId) {
  return request({
    url: `/company-configs/${configId}`,
    method: 'get'
  });
}

// 根据企业ID获取所有配置
export function getConfigsByCompanyId(companyId) {
  return request({
    url: `/company-configs/company/${companyId}`,
    method: 'get'
  });
}

// 创建企业配置
export function createCompanyConfig(data) {
  return request({
    url: '/company-configs',
    method: 'post',
    data
  });
}

// 更新企业配置
export function updateCompanyConfig(configId, data) {
  return request({
    url: `/company-configs/${configId}`,
    method: 'put',
    data
  });
}

// 删除企业配置
export function deleteCompanyConfig(configId) {
  return request({
    url: `/company-configs/${configId}`,
    method: 'delete'
  });
}

// 获取配置类型列表
export function getConfigTypes() {
  return request({
    url: '/company-configs/types',
    method: 'get'
  });
}
