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
  level?: number;
  sortOrder?: number;
  icon?: string;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  _count?: {
    products: number;
    children: number;
  };
}

export interface MetricDetail {
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface CategoryStats {
  totalCategories: MetricDetail;
  activeCategories: MetricDetail;
  subCategories: MetricDetail;
  totalProducts: MetricDetail;
  inactiveCategories: MetricDetail;
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
export interface ReviewModerationLog {
  action: string;
  moderator: string;
  timestamp: string;
  note?: string;
}

export interface ReviewResponse {
  text: string;
  responder: string;
  createdAt: string;
  isPublic: boolean;
}

export interface ReviewRatingBreakdown {
  quality: number;
  value: number;
  delivery: number;
  customerService: number;
}

export interface Review {
  id: string;
  title?: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  productCategory?: string;
  vendorId?: string;
  vendorName?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  ratingBreakdown?: ReviewRatingBreakdown;
  comment: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Published' | 'Hidden' | 'Flagged' | 'Removed';
  orderId?: string;
  createdAt: string;
  isEdited?: boolean;
  isReported?: boolean;
  reportReason?: string;
  response?: ReviewResponse;
  moderationHistory?: ReviewModerationLog[];
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

// --- Brand Types ---
export interface Brand {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  country?: string;
  website?: string;
  establishedYear?: number;
  logoUrl?: string;
  bannerUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface BrandStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  totalProducts: number;
}

export interface SystemReport {
  id: string;
  name: string;
  shortDescription: string;
  category: 'Sales' | 'Users' | 'Products' | 'Orders' | 'Finance' | 'Refunds' | 'Sellers' | 'Payments' | 'Activity';
  type: 'Summary' | 'Detailed';
  description: string;
  lastGenerated: string;
  status: 'Generated' | 'Scheduled';
}

export interface Complaint {
  id: string;
  complaintId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  subjectTitle: string;
  subjectDescription: string;
  category: 'Orders' | 'Payments' | 'Refunds' | 'Technical' | 'Account' | 'Sellers' | 'Delivery';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  channel: 'Email' | 'Chat' | 'Web' | 'Phone';
  createdAt: string;
  updatedAt: string;
}

// --- KYC Document Types ---
export interface KycMediaFile {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export type KycStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type KycDocumentType = 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'PAN' | 'AADHAAR';

export interface KycDocument {
  id: string;
  userId: string;
  documentType: KycDocumentType;
  documentNumber: string;
  frontImageId: string;
  backImageId?: string;
  selfieImageId: string;
  status: KycStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  reviewedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  frontImage: KycMediaFile;
  backImage?: KycMediaFile;
  selfieImage: KycMediaFile;
  user: {
    id: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      dateOfBirth?: string;
      gender?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
}
