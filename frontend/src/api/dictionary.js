import request from '@/utils/request';

// 获取字典列表
export const getDictionaries = (params) => {
  return request({
    url: '/dictionaries',
    method: 'get',
    params
  });
};

// 根据ID获取字典详情
export const getDictionaryById = (id) => {
  return request({
    url: `/dictionaries/${id}`,
    method: 'get'
  });
};

// 根据类型获取字典列表
export const getDictionariesByType = (type) => {
  return request({
    url: `/dictionaries/type/${type}`,
    method: 'get'
  });
};

// 根据代码获取字典
export const getDictionaryByCode = (code) => {
  return request({
    url: `/dictionaries/code/${code}`,
    method: 'get'
  });
};

// 创建字典
export const createDictionary = (data) => {
  return request({
    url: '/dictionaries',
    method: 'post',
    data
  });
};

// 更新字典
export const updateDictionary = (id, data) => {
  return request({
    url: `/dictionaries/${id}`,
    method: 'put',
    data
  });
};

// 删除字典
export const deleteDictionary = (id) => {
  return request({
    url: `/dictionaries/${id}`,
    method: 'delete'
  });
};

// 获取所有字典类型
export const getDictionaryTypes = () => {
  return request({
    url: '/dictionaries/types',
    method: 'get'
  });
};

// 批量更新排序
export const updateDictionarySortOrder = (items) => {
  return request({
    url: '/dictionaries/batch/sort',
    method: 'put',
    data: { items }
  });
};

// 更新状态
export const updateDictionaryStatus = (id, status) => {
  return request({
    url: `/dictionaries/${id}/status`,
    method: 'patch',
    data: { status }
  });
};
