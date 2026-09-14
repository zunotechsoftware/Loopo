import api from './api';
import { Category, Product, AdminUser, Report, Transaction, Subscription, AuditLog, Notification, Banner, Brand } from '@/types';

// --- Users Service ---
export const usersService = {
  getAll: (params?: {
    skip?: number;
    take?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => api.get('/admin/users', { params }),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  create: (data: Record<string, any>) => api.post('/admin/users', data),
  update: (id: string, data: Record<string, any>) => api.patch(`/admin/users/${id}`, data),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/status`, { status }),
  updateRoles: (id: string, roles: string[]) =>
    api.patch(`/admin/users/${id}/roles`, { roles }),
  suspend: (id: string) => api.patch(`/admin/users/${id}/status`, { status: 'SUSPENDED' }),
  activate: (id: string) => api.patch(`/admin/users/${id}/status`, { status: 'ACTIVE' }),
  block: (id: string) => api.patch(`/admin/users/${id}/status`, { status: 'BLOCKED' }),
};

// --- Sellers Service ---
export const sellersService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/sellers', { params }),
  getById: (id: string) => api.get(`/admin/sellers/${id}`),
  verify: (id: string) => api.patch(`/admin/sellers/${id}/verify`),
  suspend: (id: string) => api.patch(`/admin/sellers/${id}/suspend`),
  approveKyc: (id: string) => api.patch(`/admin/sellers/${id}/approve-kyc`),
};

// --- Products Service ---
export const productsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/products', { params }),
  getById: (id: string) => api.get(`/admin/products/${id}`),
  approve: (id: string) => api.patch(`/admin/products/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/admin/products/${id}/reject`, { reason }),
  feature: (id: string, featured: boolean) => api.patch(`/admin/products/${id}/feature`, { featured }),
  remove: (id: string) => api.delete(`/admin/products/${id}`),
  getStats: () => api.get('/admin/products/stats'),
  getLocations: () => api.get('/admin/products/locations'),
  update: (id: string, data: Partial<Product>) => api.patch(`/admin/products/${id}`, data),
};

// --- Categories Service ---
export const categoriesService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/categories', { params }),
  getById: (id: string) => api.get(`/admin/categories/${id}`),
  create: (data: Partial<Category>) => api.post('/admin/categories', data),
  update: (id: string, data: Partial<Category>) => api.put(`/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/admin/categories/${id}`),
  getStats: () => api.get('/admin/categories/stats'),
};

// --- Brands Service ---
export const brandsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/brands', { params }),
  getById: (id: string) => api.get(`/brands/${id}`),
  create: (data: Partial<Brand>) => api.post('/brands', data),
  update: (id: string, data: Partial<Brand>) => api.put(`/brands/${id}`, data),
  delete: (id: string) => api.delete(`/brands/${id}`),
  getStats: () => api.get('/brands/stats'),
  toggleFeatured: (id: string, isFeatured: boolean) => api.patch(`/brands/${id}/featured`, { isFeatured }),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/brands/${id}/status`, { isActive }),
};


// --- Reports Service ---
// Contract confirmed against reports/controllers/admin-reports.controller.ts
// (the real, reachable one - a second, duplicate implementation under
// admin/reports/ was deleted, see known-issues.md). assign/status/escalate
// read specific @Body() keys server-side, not a generic object.
export const reportsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/reports', { params }),
  getById: (id: string) => api.get(`/admin/reports/${id}`),
  assign: (id: string, moderatorId: string) => api.patch(`/admin/reports/${id}/assign`, { moderatorId }),
  resolve: (id: string) => api.patch(`/admin/reports/${id}/resolve`),
  reject: (id: string) => api.patch(`/admin/reports/${id}/reject`),
  escalate: (id: string, note?: string) => api.patch(`/admin/reports/${id}/escalate`, { note }),
  updateStatus: (id: string, status: string, priority?: string) =>
    api.patch(`/admin/reports/${id}/status`, { status, priority }),
};

// --- Payments Service ---
// Contract confirmed against admin-payments.controller.ts. getSubscriptions/
// getRefunds hit two endpoints added alongside this fix - there was
// previously no admin list for either (subscriptions had no admin surface
// at all; refunds only had the POST-to-create route).
export const paymentsService = {
  getPayments: (params?: { skip?: number; take?: number; status?: string }) => api.get('/admin/payments', { params }),
  getPaymentById: (id: string) => api.get(`/admin/payments/${id}`),
  getSubscriptions: (params?: { skip?: number; take?: number; status?: string }) => api.get('/admin/payments/subscriptions', { params }),
  getRefunds: (params?: { skip?: number; take?: number; status?: string }) => api.get('/admin/payments/refunds', { params }),
  issueRefund: (paymentId: string, amount: number, reason?: string) =>
    api.post('/admin/payments/refunds', { paymentId, amount, reason }),
};

// --- Analytics Service ---
export const analyticsService = {
  getSummary: (params?: Record<string, unknown>) => api.get('/admin/analytics/summary', { params }),
  getUserMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/users', { params }),
  getProductMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/products', { params }),
  getRevenueMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/revenue', { params }),
  getRevenueByCategory: (params?: Record<string, unknown>) => api.get('/admin/analytics/revenue/by-category', { params }),
  getCategoryMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/categories', { params }),
  getSearchMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/search', { params }),
  getModerationMetrics: (params?: Record<string, unknown>) => api.get('/admin/analytics/moderation', { params }),
};

// --- Reviews Service ---
// Contract confirmed against reviews/controllers/admin-reviews.controller.ts
// (a second, duplicate implementation under admin/reviews/ was deleted, see
// known-issues.md). There's no "publish" concept - a review is either
// visible or hidden, and "restore" un-hides it; delete is a soft-delete
// PATCH, not a hard DELETE (deleting also triggers a rating-recalculation
// job on the backend, which a hard DELETE route would have no hook for).
export const reviewsService = {
  getAll: (params?: { skip?: number; take?: number; type?: string }) => api.get('/admin/reviews', { params }),
  getById: (id: string) => api.get(`/admin/reviews/${id}`),
  hide: (id: string) => api.patch(`/admin/reviews/${id}/hide`),
  restore: (id: string) => api.patch(`/admin/reviews/${id}/restore`),
  delete: (id: string) => api.patch(`/admin/reviews/${id}/delete`),
};

// --- Notifications Service ---
export const notificationsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/notifications', { params }),
  getById: (id: string) => api.get(`/admin/notifications/${id}`),
  create: (data: Record<string, any>) => api.post('/admin/notifications', data),
  update: (id: string, data: Record<string, any>) => api.patch(`/admin/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/admin/notifications/${id}`),
  getStats: () => api.get('/admin/notifications/stats'),
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
// Real backend contract (confirmed against admin-settings.controller.ts /
// admin-feature-flags.controller.ts): both are bulk PUT endpoints, not
// per-key PATCH, and feature flags are their own top-level resource
// (/admin/feature-flags), not nested under /admin/settings.
export const settingsService = {
  getAll: () => api.get('/admin/settings'),
  update: (key: string, value: Record<string, unknown>, group?: string) =>
    api.put('/admin/settings', { settings: [{ key, value, group }] }),
  getFeatureFlags: () => api.get('/admin/feature-flags'),
  updateFeatureFlag: (key: string, isEnabled: boolean, name?: string, description?: string) =>
    api.put('/admin/feature-flags', { flags: [{ key, isEnabled, name, description }] }),
};

// --- Audit Logs Service ---
export const auditLogsService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/audit-logs', { params }),
  export: () => api.get('/admin/audit-logs/export', { responseType: 'blob' }),
};

// --- Roles & Permissions Service ---
// Real backend as of this session (previously /admin/roles and
// /admin/permissions didn't exist at all - see known-issues.md).
export const rolesService = {
  getAll: () => api.get('/admin/roles'),
  create: (data: { name: string; description?: string; permissionNames?: string[] }) => api.post('/admin/roles', data),
  update: (id: string, data: { name?: string; description?: string; permissionNames?: string[] }) => api.patch(`/admin/roles/${id}`, data),
  delete: (id: string) => api.delete(`/admin/roles/${id}`),
  getPermissions: () => api.get('/admin/permissions'),
};

// --- Email Templates Service ---
export const emailTemplatesService = {
  getAll: (params?: Record<string, unknown>) => api.get('/admin/email-templates', { params }),
  getById: (id: string) => api.get(`/admin/email-templates/${id}`),
  create: (data: Record<string, any>) => api.post('/admin/email-templates', data),
  update: (id: string, data: Record<string, any>) => api.patch(`/admin/email-templates/${id}`, data),
  getStats: () => api.get('/admin/email-templates/stats'),
};

// --- KYC Service ---
export const kycService = {
  getAll: (params?: {
    status?: string;
    skip?: number;
    take?: number;
  }) => api.get('/admin/kyc', { params }),
  getById: (id: string) => api.get(`/admin/kyc/${id}`),
  approve: (id: string) => api.patch(`/admin/kyc/${id}/approve`),
  reject: (id: string, remarks: string) => api.patch(`/admin/kyc/${id}/reject`, { remarks }),
};

// --- Support Tickets Service ---
export const supportTicketsService = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    category?: string;
    channel?: string;
    agent?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) => api.get('/admin/support/tickets', { params }),
  getStats: () => api.get('/admin/support/tickets/stats'),
  getById: (id: string) => api.get(`/admin/support/tickets/${id}`),
  sendReply: (id: string, data: { message: string; attachments?: Array<{ name: string; url: string; size: string }> }) =>
    api.post(`/admin/support/tickets/${id}/reply`, data),
  addNote: (id: string, data: { note: string }) =>
    api.post(`/admin/support/tickets/${id}/notes`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/support/tickets/${id}/status`, { status }),
  updatePriority: (id: string, priority: string) =>
    api.patch(`/admin/support/tickets/${id}/priority`, { priority }),
  assignAgent: (id: string, agentName: string) =>
    api.patch(`/admin/support/tickets/${id}/assign`, { agentName }),
  escalate: (id: string, data: { department: string; reason?: string }) =>
    api.post(`/admin/support/tickets/${id}/escalate`, data),
};

// --- Complaints Service ---
export const complaintsService = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    severity?: string;
    category?: string;
    channel?: string;
    department?: string;
    agent?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }) => api.get('/admin/complaints', { params }),
  getStats: () => api.get('/admin/complaints/stats'),
  getCategoriesBreakdown: () => api.get('/admin/complaints/categories-breakdown'),
  getById: (id: string) => api.get(`/admin/complaints/${id}`),
  create: (data: Record<string, any>) => api.post('/admin/complaints', data),
  addMessage: (id: string, data: { message: string; senderType?: string; senderName?: string; attachments?: Array<{ name: string; url: string; size: string }> }) =>
    api.post(`/admin/complaints/${id}/messages`, data),
  addNote: (id: string, data: { findings: string; remarks?: string }) =>
    api.post(`/admin/complaints/${id}/notes`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/complaints/${id}/status`, { status }),
  assign: (id: string, data: { department?: string; agentName?: string }) =>
    api.patch(`/admin/complaints/${id}/assign`, data),
  resolve: (id: string, data: { resolutionType: string; amount?: string; summary: string }) =>
    api.post(`/admin/complaints/${id}/resolve`, data),
  escalate: (id: string, data: { department: string; reason?: string }) =>
    api.post(`/admin/complaints/${id}/escalate`, data),
};


