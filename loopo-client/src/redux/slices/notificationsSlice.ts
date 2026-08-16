import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_NOTIFICATIONS, NotificationItem, NotificationType } from '@/mockData/notifications';
import { notificationsApi } from '@/services/notificationsApi';

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  filterTab: 'all' | 'unread' | 'offers' | 'chats' | 'system';
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  filterTab: 'all',
  loading: false,
};

/** Map backend notification type string to frontend NotificationType */
function mapType(type: string): NotificationType {
  const t = (type || '').toLowerCase();
  if (t.includes('offer') || t.includes('price')) return 'offer';
  if (t.includes('chat') || t.includes('message')) return 'chat';
  if (t.includes('kyc') || t.includes('verification')) return 'kyc';
  if (t.includes('boost') || t.includes('ad')) return 'ad_boost';
  if (t.includes('security') || t.includes('login')) return 'security';
  return 'security';
}

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    const res = await notificationsApi.getNotifications();
    if (res.success) {
      const data = res.data as any;
      const raw: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      if (raw.length > 0) {
        const items: NotificationItem[] = raw.map((n: any) => ({
          id: n.id || n._id || `notif-${Date.now()}`,
          type: mapType(n.type || ''),
          title: n.title || 'Notification',
          description: n.body || n.description || n.message || '',
          timestamp: n.createdAt
            ? new Date(n.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recently',
          isRead: Boolean(n.isRead || n.read),
          image: n.metadata?.image || n.image,
          targetTab: n.metadata?.targetTab,
          targetId: n.metadata?.targetId,
        }));
        return { items, unreadCount: data?.unreadCount ?? items.filter((i) => !i.isRead).length };
      }
    }
    return { items: MOCK_NOTIFICATIONS, unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length };
  }
);

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsFilterTab: (
      state,
      action: PayloadAction<'all' | 'unread' | 'offers' | 'chats' | 'system'>
    ) => {
      state.filterTab = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      // Fire-and-forget API call
      notificationsApi.markRead(action.payload).catch(() => {});
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
      notificationsApi.markAllRead().catch(() => {});
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotificationsThunk.rejected, (state) => {
        state.loading = false;
        if (state.items.length === 0) {
          state.items = MOCK_NOTIFICATIONS;
          state.unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
        }
      });
  },
});

export const {
  setNotificationsFilterTab,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
