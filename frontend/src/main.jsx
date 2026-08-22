import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';

axios.defaults.withCredentials = true;

// ⚡ 0. Synchronous OAuth 2.0 Token Ingestion on Initial App Load
if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const oauthSuccess = params.get('oauth') === 'success' || !!token;

    if (oauthSuccess && token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('isAuthenticated', 'true');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('OAuth sync token error:', e);
  }
}

// 1. Request Interceptor: Always attach Bearer token to all outgoing requests
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

// 2. Response Interceptor: Silent RFC 6749 401 Token Refresh Queue
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

    // Handle 401 Unauthorized errors on protected resources
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/register') &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('refreshToken');

      // If no refresh token exists, purge auth and redirect to login
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
