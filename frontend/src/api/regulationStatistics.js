import apiClient from '@/utils/request';

export function getOverview(params) {
  return apiClient.get('/regulation/statistics/overview', { params });
}

export function getViolations(params) {
  return apiClient.get('/regulation/statistics/violations', { params });
}

export function exportStatistics(params) {
  return apiClient.get('/regulation/statistics/export', {
    params,
    responseType: 'blob'
  });
}
