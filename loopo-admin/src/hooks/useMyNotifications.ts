'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from './useAuth';
import { useNotificationSocket } from './useNotificationSocket';

export interface MyNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

/** The admin app's own notification inbox - what a seller submitting a
 * listing actually lands in front of. Previously the header bell showed a
 * hardcoded `badgeContent={3}` with no data or click behaviour behind it at
 * all. */
export function useMyNotifications() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<MyNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications', { params: { page: 1, limit: 20 } });
      const data = res.data?.data;
      setItems(data?.items || []);
      setUnreadCount(data?.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useNotificationSocket({
    enabled: isAuthenticated,
    onNotification: () => refresh(),
  });

  const markRead = useCallback(async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  }, []);

  return { items, unreadCount, loading, refresh, markRead, markAllRead };
}
