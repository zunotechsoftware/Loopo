import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_CONVERSATIONS, Conversation } from '@/mockData/chats';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string;
}

const initialState: ChatState = {
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: 'conv-1',
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.unreadCount = 0;
      }
    },
    sendMessage: (
      state,
      action: PayloadAction<{ conversationId: string; text: string }>
    ) => {
      const { conversationId, text } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        const newMsg = {
          id: `m-${Date.now()}`,
          sender: 'user' as const,
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        conv.messages.push(newMsg);
        conv.lastMessage = text;
        conv.lastTime = 'Just now';
      }
    },
  },
});

export const { setActiveConversation, sendMessage } = chatSlice.actions;
export default chatSlice.reducer;
