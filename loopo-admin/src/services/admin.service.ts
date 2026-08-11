import api from './api';
import { Category, Product, AdminUser, Report, Transaction, Subscription, AuditLog, Notification, Banner } from '@/types';

// --- Users Service ---
export const usersService = {
  getAll: (params?: {
    skip?: number;
    take?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => api.get('/api/v1/admin/users', { params }),
  getById: (id: string) => api.get(`/api/v1/admin/users/${id}`),
  create: (data: Record<string, any>) => api.post('/api/v1/admin/users', data),
  update: (id: string, data: Record<string, any>) => api.patch(`/api/v1/admin/users/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/admin/users/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/v1/admin/users/${id}/status`, { status }),
  updateRoles: (id: string, roles: string[]) =>
    api.patch(`/api/v1/admin/users/${id}/roles`, { roles }),
  suspend: (id: string) => api.patch(`/api/v1/admin/users/${id}/status`, { status: 'SUSPENDED' }),
  activate: (id: string) => api.patch(`/api/v1/admin/users/${id}/status`, { status: 'ACTIVE' }),
  block: (id: string) => api.patch(`/api/v1/admin/users/${id}/status`, { status: 'BLOCKED' }),
};

// --- Sellers Service ---
export const sellersService = {
  getAll: (params?: Record<string, unknown>) => api.get('/api/v1/admin/sellers', { params }),
  getById: (id: string) => api.get(`/api/v1/admin/sellers/${id}`),
  verify: (id: string) => api.patch(`/api/v1/admin/sellers/${id}/verify`),
  suspend: (id: string) => api.patch(`/api/v1/admin/sellers/${id}/suspend`),
  approveKyc: (id: string) => api.patch(`/api/v1/admin/sellers/${id}/approve-kyc`),
};

// --- Products Service ---
export const productsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/api/v1/admin/products', { params }),
  getById: (id: string) => api.get(`/api/v1/admin/products/${id}`),
  approve: (id: string) => api.patch(`/api/v1/admin/products/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/api/v1/admin/products/${id}/reject`, { reason }),
  feature: (id: string, featured: boolean) => api.patch(`/api/v1/admin/products/${id}/feature`, { featured }),
  remove: (id: string) => api.delete(`/api/v1/admin/products/${id}`),
  getStats: () => api.get('/api/v1/admin/products/stats'),
  getLocations: () => api.get('/api/v1/admin/products/locations'),
  update: (id: string, data: Partial<Product>) => api.patch(`/api/v1/admin/products/${id}`, data),
};

// --- Categories Service ---
export const categoriesService = {
  getAll: (params?: Record<string, unknown>) => api.get('/api/v1/admin/categories', { params }),
  getById: (id: string) => api.get(`/api/v1/admin/categories/${id}`),
  create: (data: Partial<Category>) => api.post('/api/v1/admin/categories', data),
  update: (id: string, data: Partial<Category>) => api.put(`/api/v1/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/admin/categories/${id}`),
  getStats: () => api.get('/api/v1/admin/categories/stats'),
};


// --- Reports Service ---
export const reportsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/reports', { params }),
  getById: (id: string) => api.get(`/admin/reports/${id}`),
  assign: (id: string, adminId: string) => api.patch(`/admin/reports/${id}/assign`, { adminId }),
  resolve: (id: string, notes: string) => api.patch(`/admin/reports/${id}/resolve`, { notes }),
  reject: (id: string) => api.patch(`/admin/reports/${id}/reject`),
  escalate: (id: string) => api.patch(`/admin/reports/${id}/escalate`),
};

// --- Payments Service ---
export const paymentsService = {
  getTransactions: (params?: Record<string, unknown>) => api.get('/admin/payments/transactions', { params }),
  getSubscriptions: (params?: Record<string, unknown>) => api.get('/admin/payments/subscriptions', { params }),
  getRefunds: (params?: Record<string, unknown>) => api.get('/admin/payments/refunds', { params }),
  issueRefund: (transactionId: string, amount: number, reason: string) =>
    api.post(`/admin/payments/transactions/${transactionId}/refund`, { amount, reason }),
};

// --- Analytics Service ---
export const analyticsService = {
  getSummary: () => api.get('/admin/analytics/summary'),
  getUserMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/users', { params }),
  getProductMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/products', { params }),
  getRevenueMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/revenue', { params }),
  getCategoryMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/categories', { params }),
  getSearchMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/search', { params }),
  getModerationMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/moderation', { params }),
};

// --- Reviews Service ---
export const reviewsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/reviews', { params }),
  hide: (id: string) => api.patch(`/admin/reviews/${id}/hide`),
  publish: (id: string) => api.patch(`/admin/reviews/${id}/publish`),
  delete: (id: string) => api.delete(`/admin/reviews/${id}`),
};

// --- Notifications Service ---
export const notificationsService = {
  getAll: () => api.get('/admin/notifications'),
  send: (data: Partial<Notification>) => api.post('/admin/notifications/send', data),
  create: (data: Partial<Notification>) => api.post('/admin/notifications', data),
};

// --- Banners Service ---
export const bannersService = {
  getAll: () => api.get('/admin/banners'),
  create: (data: Partial<Banner>) => api.post('/admin/banners', data),
  update: (id: string, data: Partial<Banner>) => api.patch(`/admin/banners/${id}`, data),
  delete: (id: string) => api.delete(`/admin/banners/${id}`),
  toggleActive: (id: string, isActive: boolean) => api.patch(`/admin/banners/${id}/toggle`, { isActive }),
};

// --- Settings Service ---
export const settingsService = {
  getAll: () => api.get('/admin/settings'),
  update: (key: string, value: unknown) => api.patch(`/admin/settings/${key}`, { value }),
  getFeatureFlags: () => api.get('/admin/settings/feature-flags'),
  updateFeatureFlag: (key: string, enabled: boolean) => api.patch(`/admin/settings/feature-flags/${key}`, { enabled }),
};

// --- Audit Logs Service ---
export const auditLogsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/audit-logs', { params }),
  export: () => api.get('/admin/audit-logs/export', { responseType: 'blob' }),
};

// --- Roles & Permissions Service ---
export const rolesService = {
  getAll: () => api.get('/admin/roles'),
  create: (data: Record<string, unknown>) => api.post('/admin/roles', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/admin/roles/${id}`, data),
  delete: (id: string) => api.delete(`/admin/roles/${id}`),
  getPermissions: () => api.get('/admin/permissions'),
};
