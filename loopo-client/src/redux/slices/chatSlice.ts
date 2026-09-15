import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, ChatMessage } from '@/types';
import { chatApi } from '@/services/chatApi';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string;
  chatFilterTab: 'buying' | 'selling' | 'all';
  loading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: '',
  chatFilterTab: 'buying',
  loading: false,
};

/** Normalises one raw backend message into the frontend ChatMessage shape.
 * `sender` is derived by comparing the message's real `senderId` against
 * the current user's id - the previous version compared against a
 * `m.sender` string field that the backend never actually sends (every
 * message silently rendered as "sent by me" regardless of who sent it). */
function normaliseMessage(m: any, currentUserId?: string): ChatMessage {
  return {
    id: m.id || m._id,
    sender: currentUserId && m.senderId === currentUserId ? 'user' : 'other',
    text: m.content ?? m.text ?? m.body ?? '',
    time: m.createdAt
      ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    offerAmount: m.offerAmount,
    offerStatus: m.offerStatus,
    isOffer: m.isOffer,
  };
}

/** Normalise a backend conversation to the frontend Conversation shape.
 * `currentUserId` is required to correctly pick which side (buyer/seller)
 * is "me" vs "the other party" - every conversation has both a real buyer
 * and a real seller object, so guessing (e.g. "always prefer buyer") gets
 * it backwards whenever the current user IS the buyer. */
function normaliseConversation(c: any, currentUserId?: string): Conversation {
  const iAmBuyer = !!currentUserId && c.buyerId === currentUserId;
  const iAmSeller = !!currentUserId && c.sellerId === currentUserId;
  const other = iAmBuyer
    ? (c.seller || c.otherUser || {})
    : iAmSeller
    ? (c.buyer || c.otherUser || {})
    : (c.buyer || c.seller || c.otherUser || {});
  const product = c.product || c.listing || {};
  // The conversation-list endpoint only ever includes the single latest
  // message as a preview (take: 1 server-side) - full history comes from
  // fetchMessagesThunk, dispatched once a conversation is actually opened.
  const messages = Array.isArray(c.messages) ? c.messages.map((m: any) => normaliseMessage(m, currentUserId)) : [];

  const otherName = other.firstName
    ? `${other.firstName} ${other.lastName || ''}`.trim()
    : other.name || 'User';

  return {
    id: c.id || c._id || `conv-${Date.now()}`,
    type: iAmSeller ? 'selling' : 'buying',
    otherPartyId: other.id || other._id || '',
    otherPartyName: otherName,
    otherPartyAvatar:
      other.profile?.avatarUrl ||
      other.avatarUrl ||
      '',
    otherPartyRole: iAmSeller ? 'Buyer' : 'Seller',
    itemTitle: product.title || c.productTitle || 'Item',
    itemPrice: product.price ? `₹${product.price.toLocaleString('en-IN')}` : '',
    itemImage:
      (Array.isArray(product.images) ? product.images[0] : product.image) ||
      '',
    itemLocation: product.location?.city || product.location || '',
    lastMessage: c.lastMessage || (messages[messages.length - 1]?.text ?? ''),
    lastTime: c.updatedAt
      ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Recently',
    unreadCount: c.unreadCount || 0,
    messages,
    messagesLoaded: false,
  };
}

export const fetchConversationsThunk = createAsyncThunk(
  'chat/fetchConversations',
  async (type: 'buying' | 'selling' | undefined, { getState }) => {
    const res = await chatApi.getConversations(type);
    if (res.success) {
      const data = res.data as any;
      const raw: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      const currentUserId = (getState() as any).auth?.user?.id;
      return raw.map((c) => normaliseConversation(c, currentUserId));
    }
    return [];
  }
);

/** Loads the full message history for one conversation - see the note on
 * `messages` above for why this is a separate call from fetchConversationsThunk. */
export const fetchMessagesThunk = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { getState }) => {
    const res = await chatApi.getMessages(conversationId);
    const currentUserId = (getState() as any).auth?.user?.id;
    if (res.success) {
      const data = res.data as any;
      const raw: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      // Backend returns newest-first; display wants oldest-first.
      const messages = raw.map((m) => normaliseMessage(m, currentUserId)).reverse();
      return { conversationId, messages };
    }
    return { conversationId, messages: [] as ChatMessage[] };
  }
);

/** Sends a message for real (POST /chat/messages) - the old `sendMessage`
 * reducer never called the API at all, it just pushed a fake local-only
 * message into state (nothing was ever actually sent or persisted).
 * Appends an optimistic placeholder immediately via the `pending` case,
 * then reconciles with the real response - if the real message already
 * arrived over the socket in the meantime (see receiveMessage), the
 * `fulfilled` handler drops the optimistic copy without adding a duplicate. */
export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, text, tempId }: { conversationId: string; text: string; tempId: string }, { rejectWithValue }) => {
    const res = await chatApi.sendMessage(conversationId, text);
    if (res.success && res.data) {
      return { conversationId, tempId, message: res.data };
    }
    return rejectWithValue({ conversationId, tempId, error: res.error || 'Failed to send message' });
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
    /** Appends an optimistic (not-yet-confirmed) message right away. */
    addOptimisticMessage: (
      state,
      action: PayloadAction<{ conversationId: string; tempId: string; text: string }>
    ) => {
      const { conversationId, tempId, text } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.messages.push({
          id: tempId,
          sender: 'user',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pending: true,
        });
        conv.lastMessage = text;
        conv.lastTime = 'Just now';
      }
    },
    /** A message arrived live over the socket - append it unless it's
     * already present (e.g. this tab is also the sender and already
     * reconciled the optimistic copy, or the event fired twice). */
    receiveMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: any; currentUserId?: string }>
    ) => {
      const { conversationId, message, currentUserId } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv) return;
      const normalised = normaliseMessage(message, currentUserId);
      if (conv.messages.some((m) => m.id === normalised.id)) return;
      conv.messages.push(normalised);
      conv.lastMessage = normalised.text;
      conv.lastTime = 'Just now';
      if (conversationId !== state.activeConversationId) {
        conv.unreadCount += 1;
      }
    },
    /** A conversation-level update arrived (new last message / activity)
     * for a conversation whose full thread isn't necessarily loaded -
     * keeps the inbox list preview accurate even for unopened threads. */
    applyConversationUpdate: (
      state,
      action: PayloadAction<{ conversationId: string; lastMessage?: any }>
    ) => {
      const { conversationId, lastMessage } = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv || !lastMessage) return;
      conv.lastMessage = lastMessage.content ?? conv.lastMessage;
      conv.lastTime = 'Just now';
    },
    /** Removes a message from local state - used when retrying a failed
     * send, so the old failed bubble doesn't linger alongside the retry. */
    removeMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv) {
        conv.messages = conv.messages.filter((m) => m.id !== action.payload.messageId);
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
        // Preserve already-loaded full message threads across a refetch of
        // the (preview-only) conversation list, instead of clobbering them
        // back down to a single latest-message preview.
        const prevById = new Map(state.conversations.map((c) => [c.id, c]));
        state.conversations = action.payload.map((fresh) => {
          const prev = prevById.get(fresh.id);
          if (prev?.messagesLoaded) {
            return { ...fresh, messages: prev.messages, messagesLoaded: true };
          }
          return fresh;
        });
        if (!state.activeConversationId && action.payload.length > 0) {
          state.activeConversationId = action.payload[0].id;
        }
      })
      .addCase(fetchConversationsThunk.rejected, (state) => {
        state.loading = false;
        state.conversations = [];
        state.activeConversationId = '';
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.messages = messages;
          conv.messagesLoaded = true;
        }
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const { conversationId, tempId, message } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (!conv) return;
        const withoutOptimistic = conv.messages.filter((m) => m.id !== tempId);
        const realId = message.id || message._id;
        // The socket echo may have already appended the real message by
        // the time this REST response resolves - don't add it twice.
        if (withoutOptimistic.some((m) => m.id === realId)) {
          conv.messages = withoutOptimistic;
        } else {
          // This is always our own just-sent message - force sender:'user'
          // rather than deriving it from senderId (no currentUserId is
          // available in this reducer to compare against).
          conv.messages = [...withoutOptimistic, { ...normaliseMessage(message), sender: 'user' as const }];
        }
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        const payload = action.payload as { conversationId: string; tempId: string } | undefined;
        if (!payload) return;
        const conv = state.conversations.find((c) => c.id === payload.conversationId);
        const msg = conv?.messages.find((m) => m.id === payload.tempId);
        if (msg) {
          msg.pending = false;
          msg.failed = true;
        }
      });
  },
});


export const {
  setChatFilterTab,
  setActiveConversation,
  addOptimisticMessage,
  receiveMessage,
  applyConversationUpdate,
  removeMessage,
  updateOfferStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
