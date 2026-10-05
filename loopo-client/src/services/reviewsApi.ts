import { apiClient, ApiResponse } from './apiClient';

export interface ReviewTag {
  id: string;
  slug: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
}

export interface RatingInput {
  overall: number;
  communication?: number;
  responseTime?: number;
  productAccuracy?: number;
  /** Maps to the spec's "Meeting Experience" category. */
  deliveryExperience?: number;
  behaviour?: number;
  valueForMoney?: number;
  wouldRecommend?: boolean;
}

export interface ReviewPhotoInput {
  fileUrl: string;
  fileKey: string;
}

export interface CreateSellerReviewPayload {
  /** The real, server-issued rating-eligibility id - never a fabricated sellerId/productId. */
  eligibilityId: string;
  title?: string;
  content?: string;
  rating: RatingInput;
  tagIds?: string[];
  photos?: ReviewPhotoInput[];
}

export interface ReviewRating {
  overall: number;
  communication: number | null;
  responseTime: number | null;
  productAccuracy: number | null;
  deliveryExperience: number | null;
  behaviour: number | null;
  valueForMoney: number | null;
  wouldRecommend: boolean | null;
}

export interface ReviewResponse {
  id: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
}

export interface Review {
  id: string;
  reviewerId: string;
  targetUserId: string | null;
  productId: string | null;
  reviewType: string;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
  editableUntil: string | null;
  reviewer: { id: string; firstName: string; lastName: string; profileImage: string | null };
  ratings: ReviewRating[];
  tags: ReviewTag[];
  photos: { id: string; fileUrl: string; sortOrder: number }[];
  response: ReviewResponse | null;
}

export interface PaginatedReviews {
  items: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface RatingDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface PendingRating {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  orderId: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
  seller: { id: string; firstName: string; lastName: string; profileImage: string | null };
  product: { id: string; title: string; slug: string; images: { originalUrl?: string; thumbnailUrl?: string }[] };
}

export const reviewsApi = {
  async getTags(): Promise<ApiResponse<ReviewTag[]>> {
    return apiClient.get<ReviewTag[]>('/reviews/tags');
  },

  async getPhotoUploadUrl(fileName: string, fileType: string): Promise<ApiResponse<{ uploadUrl: string; fileKey: string; fileUrl: string }>> {
    return apiClient.post('/reviews/photos/upload-url', { fileName, fileType });
  },

  /** Uploads a review photo straight to S3/MinIO (bypassing apiClient - a
   * different origin, no Bearer token) and returns the {fileUrl, fileKey}
   * pair to include inline in the review submission payload. */
  async uploadReviewPhoto(file: File): Promise<ReviewPhotoInput | null> {
    const upRes = await this.getPhotoUploadUrl(file.name, file.type);
    if (!upRes.success || !upRes.data) return null;
    const { uploadUrl, fileKey, fileUrl } = upRes.data;
    const putRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!putRes.ok) return null;
    return { fileUrl, fileKey };
  },

  async submitSellerReview(payload: CreateSellerReviewPayload): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>('/reviews', { reviewType: 'SELLER_REVIEW', ...payload });
  },

  async getMyPendingRatings(): Promise<ApiResponse<PendingRating[]>> {
    return apiClient.get<PendingRating[]>('/ratings/pending');
  },

  async getPendingRatingById(id: string): Promise<ApiResponse<PendingRating>> {
    return apiClient.get<PendingRating>(`/ratings/pending/${id}`);
  },

  async getSellerReviews(sellerId: string, params?: { page?: number; limit?: number; star?: number; positiveOnly?: boolean }): Promise<ApiResponse<PaginatedReviews>> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.star) q.set('star', String(params.star));
    if (params?.positiveOnly) q.set('positiveOnly', 'true');
    const qs = q.toString();
    return apiClient.get<PaginatedReviews>(`/users/${sellerId}/reviews${qs ? `?${qs}` : ''}`);
  },

  async getRatingDistribution(sellerId: string): Promise<ApiResponse<RatingDistribution>> {
    return apiClient.get<RatingDistribution>(`/users/${sellerId}/reviews/distribution`);
  },

  async respondToReview(reviewId: string, content: string): Promise<ApiResponse<ReviewResponse>> {
    return apiClient.post<ReviewResponse>(`/reviews/${reviewId}/response`, { content });
  },

  async updateResponse(reviewId: string, content: string): Promise<ApiResponse<ReviewResponse>> {
    return apiClient.put<ReviewResponse>(`/reviews/${reviewId}/response`, { content });
  },

  async reportReview(reviewId: string, reasonCode: string, details: string, customReason?: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/reviews/${reviewId}/report`, { reasonCode, details, customReason });
  },
};
