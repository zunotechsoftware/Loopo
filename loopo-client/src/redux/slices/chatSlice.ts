import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_CONVERSATIONS, Conversation } from '@/mockData/chats';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string;
  chatFilterTab: 'buying' | 'selling' | 'all';
}

const initialState: ChatState = {
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: 'conv-buy-1',
  chatFilterTab: 'buying',
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatFilterTab: (state, action: PayloadAction<'buying' | 'selling' | 'all'>) => {
      state.chatFilterTab = action.payload;
      // Auto switch active conversation to first item in tab if current is not in filtered list
      const filtered = state.conversations.filter(
        (c) => action.payload === 'all' || c.type === action.payload
      );
      if (filtered.length > 0) {
        state.activeConversationId = filtered[0].id;
      }
    },
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
    updateOfferStatus: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; status: 'Accepted' | 'Declined' }>
    ) => {
      const { conversationId, messageId, status } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        const msg = conv.messages.find((m) => m.id === messageId);
        if (msg) {
          msg.offerStatus = status;
          conv.lastMessage = `Offer ${status.toLowerCase()}`;
        }
      }
    },
  },
});

export const { setChatFilterTab, setActiveConversation, sendMessage, updateOfferStatus } =
  chatSlice.actions;

export default chatSlice.reducer;
