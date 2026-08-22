import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';

axios.defaults.withCredentials = true;

// Global interceptor for handling 401 Unauthorized errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('isAuthenticated');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/' && !path.startsWith('/verify-otp')) {
        window.location.href = '/login';
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
