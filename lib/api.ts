import axios from 'axios';
import {
  mockClientsApi,
  mockAssetsApi,
  mockCalendarApi,
  mockPostsApi,
  mockPlatformAccountsApi,
  isDemoMode
} from './mockApi';

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

// Check if backend is available
let backendAvailable: boolean | null = null;

const checkBackend = async (): Promise<boolean> => {
  if (backendAvailable !== null) return backendAvailable;

  try {
    await api.get('/health', { timeout: 2000 });
    backendAvailable = true;
    return true;
  } catch {
    backendAvailable = false;
    return false;
  }
};

// Wrapper to use mock or real API
const createApiWrapper = <T extends Record<string, any>>(
  realApi: T,
  mockApi: T
): T => {
  const wrapper: any = {};

  for (const key in realApi) {
    wrapper[key] = async (...args: any[]) => {
      const useMock = isDemoMode() || !(await checkBackend());

      if (useMock) {
        return mockApi[key](...args);
      }

      return realApi[key](...args);
    };
  }

  return wrapper as T;
};

// Client API
const realClientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`)
};

export const clientsApi = createApiWrapper(realClientsApi, mockClientsApi);

// Assets API
const realAssetsApi = {
  getByClient: (clientId: string) => api.get(`/assets?clientId=${clientId}`),
  upload: (clientId: string, formData: FormData) => {
    return api.post(`/assets?clientId=${clientId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id: string) => api.delete(`/assets/${id}`)
};

export const assetsApi = createApiWrapper(realAssetsApi, mockAssetsApi);

// Content Calendar API
const realCalendarApi = {
  getByClient: (clientId: string) => api.get(`/content-calendar?clientId=${clientId}`),
  getAll: () => api.get('/content-calendar'),
  create: (data: any) => api.post('/content-calendar', data),
  update: (id: string, data: any) => api.put(`/content-calendar/${id}`, data),
  delete: (id: string) => api.delete(`/content-calendar/${id}`)
};

export const calendarApi = createApiWrapper(realCalendarApi, mockCalendarApi);

// Posts API
const realPostsApi = {
  getByClient: (clientId: string) => api.get(`/posts?clientId=${clientId}`),
  getAll: () => api.get('/posts'),
  getById: (id: string) => api.get(`/posts/${id}`)
};

export const postsApi = createApiWrapper(realPostsApi, mockPostsApi);

// Platform Accounts API
const realPlatformAccountsApi = {
  getByClient: (clientId: string) => api.get(`/platform-accounts?clientId=${clientId}`),
  connect: (clientId: string, platform: string) => api.post('/platform-accounts/connect', { clientId, platform }),
  disconnect: (id: string) => api.delete(`/platform-accounts/${id}`)
};

export const platformAccountsApi = createApiWrapper(realPlatformAccountsApi, mockPlatformAccountsApi);

export default api;
