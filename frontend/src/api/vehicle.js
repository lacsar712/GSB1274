import apiClient from '@/utils/request';

export function getVehicles(params) {
  return apiClient.get('/vehicles', { params });
}

export function getVehicleLocations(params) {
  return apiClient.get('/vehicles/locations', { params });
}

export function getVehicleById(id) {
  return apiClient.get(`/vehicles/${id}`);
}

export function createVehicle(data) {
  return apiClient.post('/vehicles', data);
}

export function updateVehicle(id, data) {
  return apiClient.put(`/vehicles/${id}`, data);
}

export function deleteVehicle(id) {
  return apiClient.delete(`/vehicles/${id}`);
}

export function updateVehicleStatus(id, status) {
  return apiClient.patch(`/vehicles/${id}/status`, { status });
}

export function updateVehicleLocation(id, data) {
  return apiClient.patch(`/vehicles/${id}/location`, data);
}
