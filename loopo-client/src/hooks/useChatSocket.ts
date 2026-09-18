import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/services/apiClient';

// Same host as the REST API, minus the /api/v1 suffix - the Socket.IO
// gateway is mounted on the root of the Nest app, not under that prefix.
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

interface ChatSocketOptions {
  onConversationUpdated?: (conversation: any) => void;
  onReceiveMessage?: (message: any) => void;
  onMessageRead?: (data: { conversationId: string; messageId?: string; userId: string }) => void;
  onTypingStarted?: (data: { conversationId: string; userId: string }) => void;
  onTypingStopped?: (data: { conversationId: string; userId: string }) => void;
  onMessageEdited?: (data: { conversationId: string; message: any }) => void;
  onMessageDeleted?: (data: { conversationId: string; messageId: string }) => void;
}

/** Mirrors loopo-admin's useChatSocket - same backend gateway, same event
 * names - just pointed at loopo-client's own token storage/env var. */
export const useChatSocket = (options?: ChatSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));

    socketInstance.on('conversation_updated', (data) => optionsRef.current?.onConversationUpdated?.(data));
    socketInstance.on('receive_message', (data) => optionsRef.current?.onReceiveMessage?.(data));
    socketInstance.on('message_read', (data) => optionsRef.current?.onMessageRead?.(data));
    socketInstance.on('typing_started', (data) => optionsRef.current?.onTypingStarted?.(data));
    socketInstance.on('typing_stopped', (data) => optionsRef.current?.onTypingStopped?.(data));
    socketInstance.on('message_edited', (data) => optionsRef.current?.onMessageEdited?.(data));
    socketInstance.on('message_deleted', (data) => optionsRef.current?.onMessageDeleted?.(data));

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', { conversationId });
    }
  }, []);

  const sendTypingStart = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  }, []);

  const sendTypingStop = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  }, []);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
  };
};
