import apiClient from '@/utils/request';

export function getDrivers(params) {
  return apiClient.get('/drivers', { params });
}

export function getDriverStatistics() {
  return apiClient.get('/drivers/statistics');
}

export function getDriverById(id) {
  return apiClient.get(`/drivers/${id}`);
}

export function createDriver(data) {
  return apiClient.post('/drivers', data);
}

export function updateDriver(id, data) {
  return apiClient.put(`/drivers/${id}`, data);
}

export function deleteDriver(id) {
  return apiClient.delete(`/drivers/${id}`);
}

export function batchDeleteDrivers(ids) {
  return apiClient.post('/drivers/batch/delete', { ids });
}

export function updateDriverStatus(id, status) {
  return apiClient.patch(`/drivers/${id}/status`, { status });
}
