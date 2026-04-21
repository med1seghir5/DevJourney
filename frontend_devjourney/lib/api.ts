import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let _isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/auth/login') ||
        window.location.pathname.startsWith('/auth/register'));

    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !_isRefreshing
    ) {
      originalRequest._retry = true;
      _isRefreshing = true;
      try {
        await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        _isRefreshing = false;
        return api(originalRequest);
      } catch {
        _isRefreshing = false;
        if (!isAuthRoute && typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
