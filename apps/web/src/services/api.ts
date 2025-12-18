import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string; companyName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Risks endpoints
export const risksApi = {
  list: (params?: { status?: string; severity?: string; module?: string }) =>
    api.get('/risks', { params }),
  get: (id: string) => api.get(`/risks/${id}`),
  update: (id: string, data: { status?: string; notes?: string }) =>
    api.patch(`/risks/${id}`, data),
  getHistory: (id: string) => api.get(`/risks/${id}/history`),
  getDashboard: () => api.get('/risks/dashboard'),
};

// Users endpoints
export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: { email: string; firstName: string; lastName: string; role: string }) =>
    api.post('/users', data),
  update: (id: string, data: Partial<{ email: string; firstName: string; lastName: string; role: string }>) =>
    api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Modules endpoints
export const modulesApi = {
  list: () => api.get('/modules'),
  get: (id: string) => api.get(`/modules/${id}`),
  enable: (id: string) => api.post(`/modules/${id}/enable`),
  disable: (id: string) => api.post(`/modules/${id}/disable`),
  configure: (id: string, config: Record<string, unknown>) =>
    api.patch(`/modules/${id}/config`, config),
};

// Audit endpoints
export const auditApi = {
  list: (params?: { entity_type?: string; entity_id?: string; from?: string; to?: string }) =>
    api.get('/audit', { params }),
  get: (id: string) => api.get(`/audit/${id}`),
  verify: (id: string) => api.get(`/audit/${id}/verify`),
};

// Tenant endpoints
export const tenantApi = {
  get: () => api.get('/tenants/current'),
  update: (data: { name?: string; settings?: Record<string, unknown> }) =>
    api.patch('/tenants/current', data),
  getStats: () => api.get('/tenants/current/stats'),
};

// Profile endpoints
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
    department?: string;
    location?: string;
    timezone?: string;
    bio?: string;
  }) => api.patch('/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Settings endpoints
export const settingsApi = {
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/settings/password', data),
  setup2FA: () => api.post('/settings/2fa/setup'),
  verify2FA: (data: { code: string }) => api.post('/settings/2fa/verify', data),
  disable2FA: () => api.delete('/settings/2fa'),
  getSessions: () => api.get('/settings/sessions'),
  revokeSession: (sessionId: string) => api.delete(`/settings/sessions/${sessionId}`),
  revokeAllSessions: () => api.delete('/settings/sessions'),
  getNotifications: () => api.get('/settings/notifications'),
  updateNotifications: (data: Record<string, unknown>) => api.patch('/settings/notifications', data),
  getPrivacy: () => api.get('/settings/privacy'),
  updatePrivacy: (data: Record<string, unknown>) => api.patch('/settings/privacy', data),
  exportData: () => api.get('/settings/export'),
  deleteAccount: () => api.delete('/settings/account'),
};

// Billing endpoints
export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  createCheckout: (data: { plan_id: string; billing_cycle: string; email: string; tenant_name: string }) =>
    api.post('/billing/create-checkout', data),
  getSubscription: () => api.get('/billing/subscription'),
  createSubscription: (data: { plan_id: string; billing_cycle: string }) =>
    api.post('/billing/subscription', data),
  cancelSubscription: () => api.delete('/billing/subscription'),
  reactivateSubscription: () => api.post('/billing/subscription/reactivate'),
  getInvoices: (limit?: number) => api.get('/billing/invoices', { params: { limit } }),
  createPortalSession: () => api.post('/billing/portal'),
  getUsage: () => api.get('/billing/usage'),
  canInstallModule: () => api.get('/billing/can-install-module'),
  getLimits: () => api.get('/billing/limits'),
};
