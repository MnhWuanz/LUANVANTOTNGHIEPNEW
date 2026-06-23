import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return ['/login', '/refresh', '/logout'].some((endpoint) =>
    url.includes(endpoint),
  );
};

api.interceptors.request.use(
  (config) => {
    if (_accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${API_URL}/refresh`,
          {},
          { withCredentials: true },
        );
        if (response.data?.success) {
          const { accessToken } = response.data.data;
          setAccessToken(accessToken);

          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
