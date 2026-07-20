import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { ChatService } from '../services/chat.service';
import { AuthenticatedSocket } from '../interfaces/chat.interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (client.handshake.query?.token) {
        token = client.handshake.query.token as string;
      } else if (authHeader) {
        token = authHeader;
      }

      if (!token) {
        this.logger.warn(`Disconnecting client ${client.id}: Missing token`);
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'fallback_secret';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      client.data = client.data || {};
      client.data.user = {
        id: payload.sub || payload.id,
        email: payload.email,
        roles: payload.roles || [],
      };

      const userId = client.data.user.id;

      await client.join(`user:${userId}`);
      this.logger.log(`Client ${client.id} (user: ${userId}) connected`);

      const transited = await this.chatService.trackUserConnection(userId);
      if (transited) {
        this.server.emit('user_online', { userId });
      }
    } catch (err) {
      this.logger.error(`Connection authentication failed for client ${client.id}`, err);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data?.user;
    if (user) {
      const userId = user.id;
      this.logger.log(`Client ${client.id} (user: ${userId}) disconnected`);

      const transited = await this.chatService.trackUserDisconnect(userId);
      if (transited) {
        this.server.emit('user_offline', { userId, lastSeenAt: new Date() });
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: any,
    @MessageBody('conversationId') conversationId: string,
  ) {
    const userId = client.data.user.id;
    try {
      await this.chatService.getConversationDetails(conversationId, userId);
      await client.join(`conversation:${conversationId}`);
      this.logger.log(`User ${userId} joined room conversation:${conversationId}`);
      
      await this.chatService.readMessages(conversationId, userId);
      this.server.to(`conversation:${conversationId}`).emit('message_read', { conversationId, userId });
      
      await (this.chatService as any).chatRepo.markMessagesAsDelivered(conversationId, userId);
      this.server.to(`conversation:${conversationId}`).emit('message_delivered', { conversationId, userId });
    } catch (err) {
      client.emit('error', { message: 'Failed to join conversation room: Access denied' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: any,
    @MessageBody('conversationId') conversationId: string,
  ) {
    await client.leave(`conversation:${conversationId}`);
    this.logger.log(`User ${client.data.user.id} left room conversation:${conversationId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: any,
    @MessageBody('conversationId') conversationId: string,
  ) {
    const userId = client.data.user.id;
    await this.chatService.setUserTyping(conversationId, userId, true);
    client.to(`conversation:${conversationId}`).emit('typing_started', { conversationId, userId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: any,
    @MessageBody('conversationId') conversationId: string,
  ) {
    const userId = client.data.user.id;
    await this.chatService.setUserTyping(conversationId, userId, false);
    client.to(`conversation:${conversationId}`).emit('typing_stopped', { conversationId, userId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message_read')
  async handleMessageRead(
    @ConnectedSocket() client: any,
    @MessageBody() body: { conversationId: string; messageId: string },
  ) {
    const userId = client.data.user.id;
    await this.chatService.readMessages(body.conversationId, userId);
    this.server.to(`conversation:${body.conversationId}`).emit('message_read', {
      conversationId: body.conversationId,
      messageId: body.messageId,
      userId,
    });
  }
}
