// ==========================================
// FILE: frontend/src/services/api.js
// API Service Layer for Backend Communication
// ==========================================
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
};

// Applications API
export const applicationsAPI = {
  getAll: () => apiClient.get('/applications'),
  getById: (id) => apiClient.get(`/applications/${id}`),
  create: (data) => apiClient.post('/applications', data),
  update: (id, data) => apiClient.put(`/applications/${id}`, data),
  delete: (id) => apiClient.delete(`/applications/${id}`),
};

// Tokens API
export const tokensAPI = {
  getAll: () => apiClient.get('/tokens'),
  generate: (applicationId) => apiClient.post('/tokens', { application_id: applicationId }),
};

// Documents API
export const documentsAPI = {
  upload: (formData) => apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByApplication: (appId) => apiClient.get(`/documents/application/${appId}`),
};

// Photo & Signature API
export const photoSignAPI = {
  validate: (id, data) => apiClient.put(`/photo-sign/${id}`, data),
  getByApplication: (appId) => apiClient.get(`/photo-sign/application/${appId}`),
};

// Verification API
export const verificationAPI = {
  verify: (id, data) => apiClient.post(`/verification/${id}`, data),
  getByApplication: (appId) => apiClient.get(`/verification/application/${appId}`),
};

// Processing API
export const processingAPI = {
  process: (id, data) => apiClient.post(`/processing/${id}`, data),
  getByApplication: (appId) => apiClient.get(`/processing/application/${appId}`),
};

// Approval API
export const approvalAPI = {
  approve: (id, data) => apiClient.post(`/approval/${id}`, data),
  getAll: () => apiClient.get('/approval'),
};

// Admin API
export const adminAPI = {
  getUsers: () => apiClient.get('/admin/users'),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  getStatistics: () => apiClient.get('/admin/statistics'),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
};

export default apiClient;
