import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Client API
export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`)
};

// Assets API
export const assetsApi = {
  getByClient: (clientId: string) => api.get(`/assets?clientId=${clientId}`),
  upload: (clientId: string, formData: FormData) => {
    return api.post(`/assets?clientId=${clientId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id: string) => api.delete(`/assets/${id}`)
};

// Content Calendar API
export const calendarApi = {
  getByClient: (clientId: string) => api.get(`/content-calendar?clientId=${clientId}`),
  getAll: () => api.get('/content-calendar'),
  create: (data: any) => api.post('/content-calendar', data),
  update: (id: string, data: any) => api.put(`/content-calendar/${id}`, data),
  delete: (id: string) => api.delete(`/content-calendar/${id}`)
};

// Posts API
export const postsApi = {
  getByClient: (clientId: string) => api.get(`/posts?clientId=${clientId}`),
  getAll: () => api.get('/posts'),
  getById: (id: string) => api.get(`/posts/${id}`)
};

// Platform Accounts API
export const platformAccountsApi = {
  getByClient: (clientId: string) => api.get(`/platform-accounts?clientId=${clientId}`),
  connect: (clientId: string, platform: string) => api.post('/platform-accounts/connect', { clientId, platform }),
  disconnect: (id: string) => api.delete(`/platform-accounts/${id}`)
};

export default api;
