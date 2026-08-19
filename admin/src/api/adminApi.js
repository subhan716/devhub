import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Intercept requests to attach Authorization header if token is stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devhub_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Platform Stats
export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

// User Governance & Forensics
export const getAllUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const getUserForensics = async (userId) => {
  const { data } = await api.get(`/admin/users/${userId}/forensics`);
  return data;
};

export const issueUserStrike = async (userId, payload) => {
  const { data } = await api.post(`/admin/users/${userId}/strike`, payload);
  return data;
};

export const sendAdminDirectNotice = async (userId, payload) => {
  const { data } = await api.post(`/admin/users/${userId}/send-notice`, payload);
  return data;
};

export const exportUserDataPackage = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/export-data`, {
    responseType: 'blob',
  });
  return response.data;
};

export const updateUserStatus = async (userId, payload) => {
  const { data } = await api.put(`/admin/users/${userId}/status`, payload);
  return data;
};

export const toggleUserBadge = async (userId) => {
  const { data } = await api.put(`/admin/users/${userId}/badge`);
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

export const revokeUserSessions = async (userId, reason = 'Admin session termination') => {
  const { data } = await api.post(`/admin/users/${userId}/revoke-sessions`, { reason });
  return data;
};

// Moderation Queue
export const getReportedContent = async (params = {}) => {
  const { data } = await api.get('/admin/reports', { params });
  return data;
};

export const getReports = getReportedContent;

export const moderateReport = async (reportId, payload) => {
  const { data } = await api.post(`/admin/reports/${reportId}/action`, payload);
  return data;
};

// Broadcast Announcements
export const broadcastAnnouncement = async (payload) => {
  const { data } = await api.post('/admin/broadcast', payload);
  return data;
};

// Mobile Fleet & Version Gatekeeper
export const getAppConfig = async () => {
  const { data } = await api.get('/admin/app-config');
  return data;
};

export const updateAppConfig = async (payload) => {
  const { data } = await api.put('/admin/app-config', payload);
  return data;
};

// Security Audit Logs
export const getAuditLogs = async (params = {}) => {
  const { data } = await api.get('/admin/audit-logs', { params });
  return data;
};

// Authentication
export const loginAdmin = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  if (data.token) {
    localStorage.setItem('devhub_admin_token', data.token);
  }
  return data;
};

export const logoutAdmin = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('devhub_admin_token');
  }
};

export const getAdminMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export default api;
