import apiClient from '@/utils/request';

export function getUserInfo(id) {
  return apiClient.get(`/users/${id}`);
}

export function updateUserInfo(id, data) {
  return apiClient.put(`/users/${id}`, data);
}

export function changePassword(id, data) {
  return apiClient.put(`/users/${id}/password`, data);
}

export function getPreferences(id) {
  return apiClient.get(`/users/${id}/preferences`);
}

export function updatePreferences(id, data) {
  return apiClient.put(`/users/${id}/preferences`, data);
}

export function getUserPreferences(id) {
  return getPreferences(id);
}

export function updateUserPreferences(id, data) {
  return updatePreferences(id, data);
}
