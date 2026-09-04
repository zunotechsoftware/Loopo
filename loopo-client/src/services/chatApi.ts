import { apiClient, ApiResponse } from './apiClient';
import { Conversation } from '@/mockData/chats';

export const chatApi = {
  async getConversations(type?: 'buying' | 'selling'): Promise<ApiResponse<Conversation[]>> {
    const endpoint = type ? `/chat/conversations?type=${type}` : '/chat/conversations';
    return apiClient.get<Conversation[]>(endpoint);
  },

  async sendMessage(conversationId: string, text: string): Promise<ApiResponse<any>> {
    return apiClient.post('/chat/messages', { conversationId, content: text, type: 'TEXT' });
  },

  async getMessages(conversationId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/chat/conversations/${conversationId}/messages`);
  },

  async updateOfferStatus(
    conversationId: string,
    messageId: string,
    status: 'Accepted' | 'Declined'
  ): Promise<ApiResponse<any>> {
    return apiClient.patch('/chat/offers', { conversationId, messageId, status });
  },
};
