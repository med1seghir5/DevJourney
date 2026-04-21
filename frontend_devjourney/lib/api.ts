import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let _isRefreshing = false;
let _token: string | null = null;

export const setApiToken = (token: string | null) => {
  _token = token;
};

// Request interceptor for token
api.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`;
  }
  return config;
});

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
        const response = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const newToken = response.data.token;
        if (newToken) {
          setApiToken(newToken);
        }
        _isRefreshing = false;
        return api(originalRequest);
      } catch {
        _isRefreshing = false;
        // Don't force redirect, the page will handle it if needed
      }
    }
    return Promise.reject(error);
  }
);

export default api;
