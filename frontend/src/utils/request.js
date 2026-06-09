import axios from 'axios';

const apiBase = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:8274/api');

const apiClient = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const statusText = (status) => {
  if (status === 400) return '请求参数错误';
  if (status === 401) return '未授权或登录已过期';
  if (status === 403) return '无权限访问';
  if (status === 404) return '资源不存在';
  if (status === 429) return '请求过于频繁';
  if (status === 500) return '服务器内部错误';
  if (status === 502) return '网关错误';
  if (status === 503) return '服务不可用';
  if (status === 504) return '网关超时';
  return '请求失败';
};

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    const payload = response.data;
    const normalized = {
      ...payload,
      message: payload?.message,
      code: typeof payload?.code === 'number'
        ? payload.code
        : (payload?.success === true ? 200 : (typeof payload?.code === 'number' ? payload.code : 500)),
      success: typeof payload?.success === 'boolean'
        ? payload.success
        : (payload?.code === 200)
    };
    return normalized;
  },
  error => {
    if (error.code === 'ERR_CANCELED' || /ERR_ABORTED/i.test(error.message || '')) {
      return Promise.reject({ code: 0, success: false, message: '请求已取消' });
    }
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const code = typeof data?.code === 'number' ? data.code : status;
      const base = statusText(status);
      const message = data?.message || base;
      const detail = data?.error || data?.errors || data?.detail;
      return Promise.reject({
        code,
        success: false,
        message,
        detail,
        data
      });
    } else if (error.request) {
      const tip = '网络错误，请检查网络连接';
      const detail = error?.message;
      return Promise.reject({ code: 0, success: false, message: tip, detail });
    } else {
      const tip = error.message ? `请求出现错误：${error.message}` : '请求出现错误';
      return Promise.reject({ code: 0, success: false, message: tip, detail: error?.stack });
    }
  }
);

export default apiClient;
