import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Same gateway/room convention as useChatSocket.ts - every authenticated
// socket connection joins `user:${userId}` on connect, which is what the
// backend's SocketEmitterService pushes real-time notifications to.
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

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
    const token = localStorage.getItem('accessToken');
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
