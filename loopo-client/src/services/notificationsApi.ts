import { apiClient, ApiResponse } from './apiClient';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export const notificationsApi = {
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<{ items: Notification[]; total: number; unreadCount: number }>> {
    return apiClient.get(`/notifications?page=${page}&limit=${limit}`);
  },

  async markRead(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<ApiResponse<any>> {
    return apiClient.patch('/notifications/read-all');
  },
};
