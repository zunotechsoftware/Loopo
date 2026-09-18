import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/services/apiClient';

// Same gateway as chat/useChatSocket - every authenticated socket already
// joins `user:${userId}` on connect, which is the room the backend's
// SocketEmitterService pushes real-time notifications to.
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

interface NotificationSocketOptions {
  enabled: boolean;
  onNotification?: (notification: any) => void;
}

export const useNotificationSocket = ({ enabled, onNotification }: NotificationSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled) return;
    const token = getAuthToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('notification:new', (data) => callbackRef.current?.(data));

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
};
