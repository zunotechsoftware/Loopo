import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_NOTIFICATIONS, NotificationItem } from '@/mockData/notifications';

interface NotificationsState {
  items: NotificationItem[];
  filterTab: 'all' | 'unread' | 'offers' | 'chats' | 'system';
}

const initialState: NotificationsState = {
  items: MOCK_NOTIFICATIONS,
  filterTab: 'all',
};

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
      if (item) {
        item.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
      });
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
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
