import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from '../gateways/chat.gateway';
import { CreateConversationDto, UpdateConversationSettingsDto } from '../dto/conversation.dto';
import { SendMessageDto, GetMessagesQueryDto, SearchMessagesQueryDto, GetUploadUrlDto, CreateAttachmentDto } from '../dto/message.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { ConversationEntity } from '../entities/conversation.entity';
import { MessageEntity } from '../entities/message.entity';

@ApiTags('Chat & Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // --- CONVERSATIONS ---

  @Post('conversations')
  @Permissions('chat.create')
  @ApiOperation({ summary: 'Start a new conversation for a product' })
  @ApiResponse({ status: 201, type: ConversationEntity })
  async createConversation(@Body() dto: CreateConversationDto, @Request() req: any) {
    const userId = req.user.id;
    const conversation = await this.chatService.createConversation(userId, dto);
    
    if (!conversation) {
      throw new BadRequestException('Could not create conversation');
    }

    // Notify participants over socket
    this.chatGateway.server.to(`user:${userId}`).emit('conversation_updated', conversation);
    if (conversation.participants) {
      const recipient = conversation.participants.find((p) => p.userId !== userId);
      if (recipient) {
        this.chatGateway.server.to(`user:${recipient.userId}`).emit('conversation_updated', conversation);
      }
    }

    return { message: 'Conversation initialized successfully', data: conversation };
  }

  @Get('conversations')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Get list of conversations for current user' })
  @ApiResponse({ status: 200, type: [ConversationEntity] })
  async getConversations(@Request() req: any) {
    const list = await this.chatService.getConversations(req.user.id);
    return { message: 'Conversations retrieved successfully', data: list };
  }

  @Get('conversations/:id')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Get detailed metadata of a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 200, type: ConversationEntity })
  async getConversationDetails(@Param('id') id: string, @Request() req: any) {
    const details = await this.chatService.getConversationDetails(id, req.user.id);
    return { message: 'Conversation details retrieved successfully', data: details };
  }

  @Delete('conversations/:id')
  @Permissions('chat.delete')
  @ApiOperation({ summary: 'Soft delete a conversation participant channel' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async deleteConversation(@Param('id') id: string, @Request() req: any) {
    await this.chatService.deleteConversation(id, req.user.id);
    return { message: 'Conversation deleted successfully' };
  }

  @Patch('conversations/:id/archive')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Archive/Unarchive a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async archiveConversation(
    @Param('id') id: string,
    @Body('isArchived') isArchived: boolean,
    @Request() req: any,
  ) {
    const result = await this.chatService.archiveConversation(id, req.user.id, isArchived);
    return { message: isArchived ? 'Conversation archived successfully' : 'Conversation unarchived successfully', data: result };
  }

  @Patch('conversations/:id/mute')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Mute/Unmute conversation alerts' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async muteConversation(
    @Param('id') id: string,
    @Body('isMuted') isMuted: boolean,
    @Request() req: any,
  ) {
    const result = await this.chatService.muteConversation(id, req.user.id, isMuted);
    return { message: isMuted ? 'Conversation muted successfully' : 'Conversation unmuted successfully', data: result };
  }

  // --- MESSAGES ---

  @Get('conversations/:id/messages')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Get list of messages in a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 200, type: [MessageEntity] })
  async getMessages(
    @Param('id') id: string,
    @Query() query: GetMessagesQueryDto,
    @Request() req: any,
  ) {
    const list = await this.chatService.getMessages(id, req.user.id, query.limit, query.offset);
    return { message: 'Messages retrieved successfully', data: list };
  }

  @Post('messages')
  @Permissions('chat.send')
  @ApiOperation({ summary: 'Send a new message to a conversation' })
  @ApiResponse({ status: 201, type: MessageEntity })
  async sendMessage(@Body() dto: SendMessageDto, @Request() req: any) {
    const userId = req.user.id;
    const message = await this.chatService.sendMessage(userId, dto);
    
    // Broadcast message to room
    this.chatGateway.server.to(`conversation:${dto.conversationId}`).emit('receive_message', message);
    this.chatGateway.server.to(`conversation:${dto.conversationId}`).emit('conversation_updated', {
      conversationId: dto.conversationId,
      lastMessage: message,
    });

    return { message: 'Message sent successfully', data: message };
  }

  @Delete('messages/:id')
  @Permissions('chat.delete')
  @ApiOperation({ summary: 'Soft delete a message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async deleteMessage(@Param('id') id: string, @Request() req: any) {
    const result = await this.chatService.deleteMessage(id, req.user.id);
    return { message: 'Message deleted successfully', data: result };
  }

  @Patch('messages/:id/read')
  @Permissions('chat.send')
  @ApiOperation({ summary: 'Mark messages in conversation as read' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async markMessageAsRead(@Param('id') id: string, @Request() req: any) {
    // Read conversation context of message to clear all unreads
    const message = await (this.chatService as any).chatRepo.prisma.message.findUnique({
      where: { id },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    const result = await this.chatService.readMessages(message.conversationId, req.user.id);
    
    // Notify room of read updates
    this.chatGateway.server.to(`conversation:${message.conversationId}`).emit('message_read', {
      conversationId: message.conversationId,
      messageId: id,
      userId: req.user.id,
    });

    return { message: 'Messages marked as read successfully', data: result };
  }

  @Patch('messages/:id/delete')
  @Permissions('chat.delete')
  @ApiOperation({ summary: 'Soft delete a message as sender' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async softDeleteMessage(@Param('id') id: string, @Request() req: any) {
    const result = await this.chatService.deleteMessage(id, req.user.id);
    return { message: 'Message soft deleted successfully', data: result };
  }

  // --- ATTACHMENTS ---

  @Post('upload-url')
  @Permissions('chat.send')
  @ApiOperation({ summary: 'Get a signed S3 upload URL for attachments' })
  async getUploadUrl(@Body() dto: GetUploadUrlDto, @Request() req: any) {
    const result = await this.chatService.generateUploadUrl(req.user.id, dto.fileName, dto.fileType);
    return { message: 'Presigned upload URL generated successfully', data: result };
  }

  @Post('attachments')
  @Permissions('chat.send')
  @ApiOperation({ summary: 'Register message attachment details' })
  async registerAttachment(
    @Body() dto: CreateAttachmentDto & { messageId: string },
  ) {
    const result = await this.chatService.registerAttachment(dto.messageId, dto);
    return { message: 'Attachment registered successfully', data: result };
  }

  // --- BLOCK USERS ---

  @Post('block/:userId')
  @Permissions('chat.create')
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'userId', description: 'User ID to block' })
  async blockUser(@Param('userId') userId: string, @Request() req: any) {
    const result = await this.chatService.blockUser(req.user.id, userId);
    return { message: 'User blocked successfully', data: result };
  }

  @Delete('block/:userId')
  @Permissions('chat.create')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'userId', description: 'User ID to unblock' })
  async unblockUser(@Param('userId') userId: string, @Request() req: any) {
    const result = await this.chatService.unblockUser(req.user.id, userId);
    return { message: 'User unblocked successfully', data: result };
  }

  // --- PRESENCE ---

  @Get('presence/:userId')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Get user presence' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getPresence(@Param('userId') userId: string) {
    const result = await this.chatService.getPresence(userId);
    return { message: 'User presence retrieved successfully', data: result };
  }

  // --- MESSAGE SEARCH ---

  @Get('search')
  @Permissions('chat.view')
  @ApiOperation({ summary: 'Search keyword query in messages' })
  async searchMessages(@Query() query: SearchMessagesQueryDto, @Request() req: any) {
    const result = await this.chatService.searchMessages(req.user.id, query);
    return { message: 'Messages search results retrieved', data: result };
  }
}
