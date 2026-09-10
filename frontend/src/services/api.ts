import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ww_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && err.config && !err.config._retry) {
      const token = localStorage.getItem('ww_token');
      if (token) {
        err.config._retry = true;
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', null, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.setItem('ww_token', data.token);
          err.config.headers.Authorization = `Bearer ${data.token}`;
          return api(err.config);
        } catch {
          localStorage.removeItem('ww_token');
          localStorage.removeItem('ww_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
