import { apiClient, ApiResponse } from './apiClient';

export type ReportTargetType = 'LISTING' | 'USER' | 'CHAT_MESSAGE' | 'CATEGORY' | 'SYSTEM';

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: string;
  customReason?: string;
  details: string;
}

export interface ReviewPayload {
  sellerId?: string;
  productId?: string;
  rating: number;
  comment: string;
}

export const interactionsApi = {
  async submitReport(payload: ReportPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/reports', payload);
  },

  async submitReview(payload: ReviewPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/reviews', payload);
  },
};
