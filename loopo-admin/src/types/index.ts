// Shared API types and interfaces

// --- Pagination ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- User Types ---
export interface UserRole {
  role: {
    id: string;
    name: string;
  };
}

export interface UserProfile {
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'DELETED' | 'PENDING_VERIFICATION';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  roles: UserRole[];
  profile?: UserProfile;
}

// --- Product Types ---
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  vendor: string;
  status: 'Active' | 'Pending Approval' | 'Rejected' | 'Removed';
  featured: boolean;
  createdAt: string;
  images?: string[];
}

// --- Category Types ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  attributes?: CategoryAttribute[];
  isActive: boolean;
  createdAt: string;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
}

// --- Report Types ---
export interface Report {
  id: string;
  type: 'Product' | 'User' | 'Review';
  targetId: string;
  targetTitle: string;
  reason: string;
  description: string;
  reportedBy: string;
  status: 'Open' | 'Assigned' | 'Resolved' | 'Rejected' | 'Escalated';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

// --- Payment Types ---
export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  gateway: string;
  buyerName: string;
  sellerName: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  planName: string;
  price: number;
  billingCycle: 'Monthly' | 'Yearly';
  status: 'Active' | 'Cancelled' | 'Expired';
  startDate: string;
  endDate: string;
}

// --- Analytics Types ---
export interface AnalyticsMetric {
  date: string;
  value: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  newUsersToday: number;
  activeListings: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
}

// --- Review Types ---
export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'Published' | 'Hidden' | 'Flagged';
  createdAt: string;
}

// --- Notification Types ---
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'All' | 'Vendors' | 'Buyers' | 'Specific';
  targetUserIds?: string[];
  sentAt?: string;
  status: 'Draft' | 'Sent' | 'Scheduled';
}

// --- Banner Types ---
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  placement: 'Home' | 'Category' | 'Search';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// --- Audit Log Types ---
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

// --- Settings Types ---
export interface SystemSetting {
  key: string;
  value: string | boolean | number;
  label: string;
  description: string;
  type: 'text' | 'boolean' | 'number' | 'select';
  options?: string[];
}
