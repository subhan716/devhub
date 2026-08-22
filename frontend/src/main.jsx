import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';

axios.defaults.withCredentials = true;

// ⚡ 0. SYNCHRONOUS OAUTH TOKEN CAPTURE BEFORE ANY COMPONENT RENDERS
if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const refreshParam = params.get('refreshToken');
    const isOAuth = params.get('oauth') === 'success' || !!tokenParam;

    if (isOAuth && tokenParam) {
      localStorage.setItem('accessToken', tokenParam);
      localStorage.setItem('token', tokenParam);
      if (refreshParam) {
        localStorage.setItem('refreshToken', refreshParam);
      }
      localStorage.setItem('isAuthenticated', 'true');
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenParam}`;
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (e) {
    console.warn('OAuth sync init error:', e);
  }
}

// 1. Request Interceptor: Attach Bearer Token to all outgoing requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Silent 401 Refresh & Graceful Logout
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not an auth endpoint
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/register') &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/' && !path.startsWith('/verify-otp')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://devhub-api-node.onrender.com';
        const { data } = await axios.post(`${apiUrl}/api/auth/refresh`, { refreshToken });

        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('token', data.accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/' && !path.startsWith('/verify-otp')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
