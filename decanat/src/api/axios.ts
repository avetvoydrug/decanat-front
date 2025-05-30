import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status >= 400 || error.response?.status <= 501 ) {
      localStorage.removeItem('access_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;