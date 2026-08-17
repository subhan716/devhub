import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAllUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const updateUserStatus = async (userId, payload) => {
  const { data } = await api.put(`/admin/users/${userId}/status`, payload);
  return data;
};

export const getReportedContent = async (params = {}) => {
  const { data } = await api.get('/admin/reports', { params });
  return data;
};

export const moderateReport = async (reportId, payload) => {
  const { data } = await api.post(`/admin/reports/${reportId}/action`, payload);
  return data;
};

export const broadcastAnnouncement = async (payload) => {
  const { data } = await api.post('/admin/broadcast', payload);
  return data;
};

export const loginAdmin = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const logoutAdmin = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getAdminMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export default api;
