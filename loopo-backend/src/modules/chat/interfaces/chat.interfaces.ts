import { Socket } from 'socket.io';

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthenticatedUser;
  };
}

export interface TypingIndicatorState {
  conversationId: string;
  userId: string;
  displayName: string;
  timestamp: number;
}
