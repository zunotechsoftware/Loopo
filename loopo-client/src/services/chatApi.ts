import { apiClient, ApiResponse } from './apiClient';
import { Conversation } from '@/types';


export const chatApi = {
  async getConversations(type?: 'buying' | 'selling'): Promise<ApiResponse<Conversation[]>> {
    const endpoint = type ? `/chat/conversations?type=${type}` : '/chat/conversations';
    return apiClient.get<Conversation[]>(endpoint);
  },

  /** Starts (or finds the existing) conversation for a product listing -
   * the backend derives the seller from the product and dedupes against
   * any conversation the two of you already have for it. */
  async startConversationForProduct(productId: string): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post<{ id: string }>('/chat/conversations', { productId });
  },

  /** Real backend fields are {conversationId, content, type} - this used
   * to send {conversationId, text}, which the real SendMessageDto doesn't
   * even declare a field for (content was silently never set). */
  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<any>> {
    return apiClient.post('/chat/messages', { conversationId, content, type: 'TEXT' });
  },

  /** Full message history for one conversation - the conversations list
   * endpoint only ever returns each conversation's single latest message
   * (a preview), never the full thread. */
  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  },

  async updateOfferStatus(
    conversationId: string,
    messageId: string,
    status: 'Accepted' | 'Declined'
  ): Promise<ApiResponse<any>> {
    return apiClient.patch('/chat/offers', { conversationId, messageId, status });
  },
};
