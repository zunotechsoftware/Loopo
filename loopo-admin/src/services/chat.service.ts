import api from './api';

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  createConversation: (data: { participantId?: string; productId?: string }) => api.post('/chat/conversations', data),
  getConversationDetails: (id: string) => api.get(`/chat/conversations/${id}`),
  getMessages: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data: { conversationId: string; content?: string; type?: string; metadata?: any; attachments?: any[] }) =>
    api.post('/chat/messages', data),
  markAsRead: (messageId: string) => api.patch(`/chat/messages/${messageId}/read`),
  reactToMessage: (messageId: string, emoji: string) => api.post(`/chat/messages/${messageId}/react`, { emoji }),
  getUploadUrl: (data: { fileName: string; fileType: string }) => api.post('/chat/upload-url', data),
};
