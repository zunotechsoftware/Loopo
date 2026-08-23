import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

interface ChatSocketOptions {
  onConversationUpdated?: (conversation: any) => void;
  onReceiveMessage?: (message: any) => void;
  onMessageRead?: (data: { conversationId: string; messageId: string; userId: string }) => void;
  onTypingStarted?: (data: { conversationId: string; userId: string }) => void;
  onTypingStopped?: (data: { conversationId: string; userId: string }) => void;
  onMessageEdited?: (data: { conversationId: string; message: any }) => void;
  onMessageDeleted?: (data: { conversationId: string; messageId: string }) => void;
  onMessageReaction?: (data: { conversationId: string; messageId: string; userId: string; emoji: string; action: 'added' | 'removed' }) => void;
}

export const useChatSocket = (options?: ChatSocketOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Chat socket connected');
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('Chat socket disconnected');
      setIsConnected(false);
      setSocket(null);
    });

    socketInstance.on('conversation_updated', (data) => optionsRef.current?.onConversationUpdated?.(data));
    socketInstance.on('receive_message', (data) => optionsRef.current?.onReceiveMessage?.(data));
    socketInstance.on('message_read', (data) => optionsRef.current?.onMessageRead?.(data));
    socketInstance.on('typing_started', (data) => optionsRef.current?.onTypingStarted?.(data));
    socketInstance.on('typing_stopped', (data) => optionsRef.current?.onTypingStopped?.(data));
    socketInstance.on('message_edited', (data) => optionsRef.current?.onMessageEdited?.(data));
    socketInstance.on('message_deleted', (data) => optionsRef.current?.onMessageDeleted?.(data));
    socketInstance.on('message_reaction', (data) => optionsRef.current?.onMessageReaction?.(data));

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

  const markMessageRead = useCallback((conversationId: string, messageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message_read', { conversationId, messageId });
    }
  }, []);

  return {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
    markMessageRead,
  };
};
