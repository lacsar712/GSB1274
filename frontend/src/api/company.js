import request from '@/utils/request';

// 企业注册
export const registerCompany = (data) => {
  return request({
    url: '/companies/register',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 获取待审核企业列表
export const getPendingCompanies = () => {
  return request({
    url: '/companies/pending',
    method: 'get'
  });
};

// 获取企业列表
export const getCompanies = (params) => {
  return request({
    url: '/companies',
    method: 'get',
    params
  });
};

export const getCompanyList = (params) => {
  return getCompanies(params);
};

// 获取企业详情
export const getCompanyDetail = (id) => {
  return request({
    url: `/companies/${id}`,
    method: 'get'
  });
};

// 审核通过企业
export const approveCompany = (id) => {
  return request({
    url: `/companies/${id}/approve`,
    method: 'put'
  });
};

// 驳回企业申请
export const rejectCompany = (id, reason) => {
  return request({
    url: `/companies/${id}/reject`,
    method: 'put',
    data: { reason }
  });
};

// 更新企业信息
export const updateCompany = (id, data) => {
  return request({
    url: `/companies/${id}`,
    method: 'put',
    data
  });
};

// 上传企业资质
export const uploadQualification = (id, file) => {
  const formData = new FormData();
  formData.append('qualification', file);
  return request({
    url: `/companies/${id}/qualifications`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 删除企业资质
export const deleteQualification = (id, filePath) => {
  return request({
    url: `/companies/${id}/qualifications`,
    method: 'delete',
    data: { filePath }
  });
};

// 获取企业系统配置
export const getCompanyConfig = (id) => {
  return request({
    url: `/companies/${id}/config`,
    method: 'get'
  });
};

// 更新企业系统配置
export const updateCompanyConfig = (id, data) => {
  return request({
    url: `/companies/${id}/config`,
    method: 'put',
    data
  });
};

// 获取企业用户列表
export const getCompanyUsers = (id, params) => {
  return request({
    url: `/companies/${id}/users`,
    method: 'get',
    params
  });
};

// 创建企业用户
export const createCompanyUser = (id, data) => {
  return request({
    url: `/companies/${id}/users`,
    method: 'post',
    data
  });
};

// 更新企业用户
export const updateCompanyUser = (id, userId, data) => {
  return request({
    url: `/companies/${id}/users/${userId}`,
    method: 'put',
    data
  });
};

// 删除企业用户
export const deleteCompanyUser = (id, userId) => {
  return request({
    url: `/companies/${id}/users/${userId}`,
    method: 'delete'
  });
};

// 获取企业日志
export const getCompanyLogs = (id, params) => {
  return request({
    url: `/companies/${id}/logs`,
    method: 'get',
    params
  });
};

// 导出企业日志
export const exportCompanyLogs = (id, params) => {
  return request({
    url: `/companies/${id}/logs/export`,
    method: 'get',
    params,
    responseType: 'blob'
  });
};
