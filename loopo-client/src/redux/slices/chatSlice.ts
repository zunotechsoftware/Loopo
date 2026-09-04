import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_CONVERSATIONS, Conversation } from '@/mockData/chats';
import { chatApi } from '@/services/chatApi';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string;
  chatFilterTab: 'buying' | 'selling' | 'all';
  loading: boolean;
}

const initialState: ChatState = {
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: MOCK_CONVERSATIONS[0]?.id || 'conv-buy-1',
  chatFilterTab: 'buying',
  loading: false,
};

/** Normalise a backend conversation to the frontend Conversation shape */
function normaliseConversation(c: any): Conversation {
  const other = c.buyer || c.seller || c.otherUser || {};
  const product = c.product || c.listing || {};
  const messages = Array.isArray(c.messages)
    ? c.messages.map((m: any) => ({
        id: m.id || m._id || `m-${Date.now()}`,
        sender: m.sender === 'seller' ? 'other' : ('user' as 'user' | 'other'),
        text: m.content || m.text || m.body || '',
        time: m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        offerAmount: m.offerAmount,
        offerStatus: m.offerStatus,
      }))
    : [];

  const otherName = other.firstName
    ? `${other.firstName} ${other.lastName || ''}`.trim()
    : other.name || 'User';

  return {
    id: c.id || c._id || `conv-${Date.now()}`,
    type: c.type === 'selling' ? 'selling' : 'buying',
    otherPartyName: otherName,
    otherPartyAvatar:
      other.profile?.avatarUrl ||
      other.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    otherPartyRole: c.type === 'selling' ? 'Buyer' : 'Seller',
    itemTitle: product.title || c.productTitle || 'Item',
    itemPrice: product.price ? `₹${product.price.toLocaleString('en-IN')}` : '',
    itemImage:
      (Array.isArray(product.images) ? product.images[0] : product.image) ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop',
    itemLocation: product.location?.city || product.location || '',
    lastMessage: c.lastMessage || (messages[messages.length - 1]?.text ?? ''),
    lastTime: c.updatedAt
      ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Recently',
    unreadCount: c.unreadCount || 0,
    messages,
  };
}

export const fetchConversationsThunk = createAsyncThunk(
  'chat/fetchConversations',
  async (type?: 'buying' | 'selling') => {
    const res = await chatApi.getConversations(type);
    if (res.success) {
      const data = res.data as any;
      const raw: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      if (raw.length > 0) {
        return raw.map(normaliseConversation);
      }
    }
    return MOCK_CONVERSATIONS;
  }
);

export const fetchMessagesThunk = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string) => {
    const res = await chatApi.getMessages(conversationId);
    if (res.success) {
      return { conversationId, messages: res.data };
    }
    throw new Error('Failed to fetch messages');
  }
);

export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessageThunk',
  async (payload: { conversationId: string; text: string }) => {
    const res = await chatApi.sendMessage(payload.conversationId, payload.text);
    if (res.success) {
      return { conversationId: payload.conversationId, message: res.data };
    }
    throw new Error('Failed to send message');
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatFilterTab: (state, action: PayloadAction<'buying' | 'selling' | 'all'>) => {
      state.chatFilterTab = action.payload;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversationsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        if (!state.activeConversationId && action.payload.length > 0) {
          state.activeConversationId = action.payload[0].id;
        }
      })
      .addCase(fetchConversationsThunk.rejected, (state) => {
        state.loading = false;
        // Fallback to mock data on error
        if (state.conversations.length === 0) {
          state.conversations = MOCK_CONVERSATIONS;
          state.activeConversationId = MOCK_CONVERSATIONS[0]?.id || '';
        }
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) {
          // Normalize messages
          conv.messages = Array.isArray(messages) ? messages.map((m: any) => ({
            id: m.id || m._id || `m-${Date.now()}`,
            sender: m.senderId === state.activeConversationId /* Note: In a real app we'd compare against current userId */ ? 'other' : 'user', // Basic assumption for now
            text: m.content || m.text || m.body || '',
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
          })) : [];
        }
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          const newMsg = {
            id: message.id || `m-${Date.now()}`,
            sender: 'user' as const,
            text: message.content || message.text || '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          // Don't add if already added by real-time socket
          if (!conv.messages.find(m => m.id === newMsg.id)) {
             conv.messages.push(newMsg);
          }
          conv.lastMessage = newMsg.text;
          conv.lastTime = 'Just now';
        }
      });
  },
});

export const { setChatFilterTab, setActiveConversation, sendMessage, updateOfferStatus } =
  chatSlice.actions;

export default chatSlice.reducer;
