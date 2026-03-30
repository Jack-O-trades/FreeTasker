import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/accounts/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return api.request(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ---- Auth ----
export const login = (email, password) =>
  api.post('/accounts/login/', { email, password });
export const register = (data) =>
  api.post('/accounts/register/', data);
export const getMe = () =>
  api.get('/accounts/profile/');
export const updateProfile = (data) =>
  api.patch('/accounts/profile/', data);

// ---- Projects ----
export const getProjects = (params) =>
  api.get('/projects/', { params });
export const getRecommendedProjects = () =>
  api.get('/projects/recommended/');
export const getProject = (id) =>
  api.get(`/projects/${id}/`);
export const createProject = (data) => {
  if (data instanceof FormData) {
    return api.post('/projects/create/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/projects/create/', data);
};
export const updateProject = (id, data) =>
  api.patch(`/projects/${id}/update/`, data);
export const getMyProjects = () =>
  api.get('/projects/my/');

// ---- Bids ----
export const createBid = (data) =>
  api.post('/bids/', data);
export const getMyBids = () =>
  api.get('/bids/my/');
export const getProjectBids = (projectId) =>
  api.get(`/bids/project/${projectId}/`);
export const updateBidStatus = (bidId, data) =>
  api.patch(`/bids/${bidId}/status/`, data);

// ---- Chat ----
export const getChatRooms = () =>
  api.get('/chat/rooms/');
export const getChatMessages = (roomId) =>
  api.get(`/chat/rooms/${roomId}/messages/`);

// ---- Reports / Admin ----
export const getAdminReports = () =>
  api.get('/reports/admin/');
export const actionReport = (id, data) =>
  api.patch(`/reports/admin/${id}/action/`, data);
export const getProfanityReports = (params) =>
  api.get('/reports/admin/profanity/', { params });
export const actionProfanityReport = (id, data) =>
  api.patch(`/reports/admin/profanity/${id}/action/`, data);
export const getAdminUsers = () =>
  api.get('/reports/admin/users/');
export const banUser = (userId, data) =>
  api.post(`/reports/admin/users/${userId}/ban/`, data);
