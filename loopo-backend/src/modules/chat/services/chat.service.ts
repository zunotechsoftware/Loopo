import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { ProductsService } from '../../products/services/products.service';
import { UsersService } from '../../users/services/users.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { S3Service } from '../../../shared/services/s3.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MessageType, MessageStatus } from '@prisma/client';
import { CreateConversationDto, UpdateConversationSettingsDto } from '../dto/conversation.dto';
import { SendMessageDto, SearchMessagesQueryDto, CreateAttachmentDto } from '../dto/message.dto';
import Redis from 'ioredis';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectQueue('image-compression') private readonly imageCompressionQueue: Queue,
    @InjectQueue('thumbnail-generation') private readonly thumbnailGenerationQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('message-analytics') private readonly analyticsQueue: Queue,
    @InjectQueue('conversation-cleanup') private readonly cleanupQueue: Queue,
  ) {}

  // --- CONVERSATIONS ---

  async createConversation(userId: string, dto: CreateConversationDto) {
    // 1. Fetch product and verify existence
    const product = await this.productsService.updateProduct // Wait, let's use productsService.updateProduct or search for product
      ? await this.prismaFindProduct(dto.productId)
      : null;

    if (!product) {
      throw new NotFoundException(`Product listing with ID ${dto.productId} not found`);
    }

    const sellerId = product.sellerId;

    // 2. Validate participants (prevent self-chat)
    if (userId === sellerId) {
      throw new BadRequestException('You cannot start a conversation with yourself about your own product');
    }

    // 3. Block check: Verify neither user has blocked the other
    const isBlocked = await this.checkBlockStatus(userId, sellerId);
    if (isBlocked) {
      throw new ForbiddenException('Cannot start conversation due to user block restrictions');
    }

    // 4. Prevent duplicates: Find existing conversation for (productId, buyerId, sellerId)
    const existing = await this.chatRepo.findConversation(dto.productId, userId, sellerId);
    if (existing) {
      return existing;
    }

    // 5. Create new conversation
    return this.chatRepo.createConversation(dto.productId, userId, sellerId);
  }

  private async prismaFindProduct(productId: string) {
    // Helper to query product details through product service/repo
    try {
      return await (this.productsService as any).productsRepo.findById(productId);
    } catch {
      return null;
    }
  }

  async getConversations(userId: string) {
    const list = await this.chatRepo.findUserConversations(userId);
    
    // Enrich with unread counts from Redis
    return Promise.all(
      list.map(async (conv) => {
        const unreadKey = `chat:unread:${userId}:${conv.id}`;
        let unreadCountStr = await this.redis.get(unreadKey);
        
        if (unreadCountStr === null) {
          // Cache miss: compute from database and cache
          const participant = conv.participants.find((p) => p.userId === userId);
          const lastRead = participant ? participant.lastReadAt : new Date(0);
          
          const dbUnreadCount = await (this.chatRepo as any).prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: userId },
              createdAt: { gt: lastRead },
              deletedAt: null,
            },
          });
          
          await this.redis.set(unreadKey, String(dbUnreadCount));
          unreadCountStr = String(dbUnreadCount);
        }
        
        return {
          ...conv,
          unreadCount: parseInt(unreadCountStr || '0', 10),
        };
      }),
    );
  }

  async getConversationDetails(conversationId: string, userId: string) {
    const conv = await this.chatRepo.findConversationDetails(conversationId, userId);
    if (!conv) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found or access denied`);
    }
    return conv;
  }

  // --- MESSAGES ---

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const conversation = await this.chatRepo.findConversationDetails(dto.conversationId, senderId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Resolve recipient
    const recipientParticipant = conversation.participants.find((p) => p.userId !== senderId);
    if (!recipientParticipant) {
      throw new BadRequestException('Conversation has no active recipient');
    }
    const recipientId = recipientParticipant.userId;

    // Block validation
    const isBlocked = await this.checkBlockStatus(senderId, recipientId);
    if (isBlocked) {
      throw new ForbiddenException('Cannot send message: Block restrictions are in place');
    }

    // Save message to database
    const message = await this.chatRepo.createMessage({
      conversationId: dto.conversationId,
      senderId,
      type: dto.type,
      content: dto.content,
      attachments: dto.attachments,
    });

    // Check if recipient is online in Redis
    const recipientOnlineKey = `presence:online:${recipientId}`;
    const recipientSessions = await this.redis.get(recipientOnlineKey);
    const isRecipientOnline = recipientSessions && parseInt(recipientSessions, 10) > 0;

    if (isRecipientOnline) {
      // Mark as DELIVERED if online
      await this.chatRepo.updateMessageStatus(message.id, MessageStatus.DELIVERED);
      message.status = MessageStatus.DELIVERED;
    } else {
      // recipient is offline: Queue push notification job
      await this.notificationQueue.add('send_push', {
        type: 'NEW_CHAT_MESSAGE',
        userId: recipientId,
        senderId,
        content: dto.content,
        conversationId: dto.conversationId,
      });
    }

    // Increment recipient's unread count in Redis
    const unreadKey = `chat:unread:${recipientId}:${dto.conversationId}`;
    await this.redis.incr(unreadKey);

    // Queue BullMQ background processing jobs
    if (dto.type === MessageType.IMAGE && dto.attachments && dto.attachments.length > 0) {
      for (const attachment of dto.attachments) {
        // Trigger Image Compression & Thumbnail Generation in background
        await this.imageCompressionQueue.add('compress_image', {
          originalUrl: attachment.originalUrl,
          messageId: message.id,
        });
        await this.thumbnailGenerationQueue.add('generate_thumbnail', {
          originalUrl: attachment.originalUrl,
          messageId: message.id,
        });
      }
    }

    // Queue Analytics job
    await this.analyticsQueue.add('track_message', {
      messageId: message.id,
      senderId,
      type: dto.type,
    });

    return message;
  }

  async getMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
    // Verify participant
    const conversation = await this.chatRepo.findConversationDetails(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Retrieve messages
    return this.chatRepo.getConversationMessages(conversationId, limit, offset);
  }

  async deleteMessage(messageId: string, userId: string) {
    return this.chatRepo.deleteMessage(messageId, userId);
  }

  async deleteConversation(conversationId: string, userId: string) {
    const result = await this.chatRepo.deleteConversation(conversationId, userId);
    // Queue Cleanup job
    await this.cleanupQueue.add('conversation_cleanup', { conversationId, userId });
    return result;
  }

  async readMessages(conversationId: string, userId: string) {
    // Mark all received messages in this conversation as READ
    await this.chatRepo.markMessagesAsRead(conversationId, userId);
    
    // Reset unread count to 0 in Redis
    const unreadKey = `chat:unread:${userId}:${conversationId}`;
    await this.redis.set(unreadKey, '0');

    return { success: true };
  }

  // --- SETTINGS ---

  async muteConversation(conversationId: string, userId: string, isMuted: boolean) {
    return this.chatRepo.updateConversationSettings(conversationId, userId, {
      isMuted,
      mutedUntil: isMuted ? new Date(Date.now() + 86400 * 1000 * 7) : null, // Muted for 7 days by default
    });
  }

  async archiveConversation(conversationId: string, userId: string, isArchived: boolean) {
    return this.chatRepo.updateConversationSettings(conversationId, userId, {
      isArchived,
    });
  }

  async pinConversation(conversationId: string, userId: string, isPinned: boolean) {
    return this.chatRepo.updateConversationSettings(conversationId, userId, {
      isPinned,
    });
  }

  // --- BLOCKS ---

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }
    const result = await this.chatRepo.blockUser(blockerId, blockedId);
    
    // Cache block in Redis
    const cacheKey = `chat:block:${blockerId}:${blockedId}`;
    await this.redis.set(cacheKey, '1', 'EX', 86400 * 30); // 30 days TTL cache

    return result;
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const result = await this.chatRepo.unblockUser(blockerId, blockedId);
    
    // Remove from Redis cache
    const cacheKey = `chat:block:${blockerId}:${blockedId}`;
    await this.redis.del(cacheKey);

    return result;
  }

  private async checkBlockStatus(userId1: string, userId2: string): Promise<boolean> {
    // 1. Check Redis cache first
    const cacheKey1 = `chat:block:${userId1}:${userId2}`;
    const cacheKey2 = `chat:block:${userId2}:${userId1}`;
    
    const [cached1, cached2] = await Promise.all([
      this.redis.get(cacheKey1),
      this.redis.get(cacheKey2),
    ]);

    if (cached1 === '1' || cached2 === '1') {
      return true;
    }

    // 2. Check Database if not cached
    const isBlockedDb = await this.chatRepo.isBlocked(userId1, userId2);
    if (isBlockedDb) {
      // Seed Redis cache
      await Promise.all([
        this.redis.set(cacheKey1, '1', 'EX', 86400),
        this.redis.set(cacheKey2, '1', 'EX', 86400),
      ]);
    }

    return isBlockedDb;
  }

  // --- PRESENCE ---

  async getPresence(userId: string) {
    const presence = await this.chatRepo.getPresence(userId);
    if (!presence) {
      return { userId, isOnline: false, lastSeenAt: new Date(0) };
    }
    return presence;
  }

  async trackUserConnection(userId: string): Promise<boolean> {
    try {
      if (this.redis.status !== 'ready') return false;
      const onlineKey = `presence:online:${userId}`;
      const count = await this.redis.incr(onlineKey);
      
      if (count === 1) {
        // Transition offline -> online: Update DB and notify
        await this.chatRepo.upsertPresence(userId, true);
        return true; // Transited online
      }
    } catch (err) {
      this.logger.warn(`Failed to track user connection for ${userId}: ${err.message}`);
    }
    return false;
  }

  async trackUserDisconnect(userId: string): Promise<boolean> {
    try {
      if (this.redis.status !== 'ready') return false;
      const onlineKey = `presence:online:${userId}`;
      const count = await this.redis.decr(onlineKey);
      
      if (count <= 0) {
        // Ensure count doesn't fall below zero
        await this.redis.set(onlineKey, '0', 'EX', 3600);
        // Transition online -> offline: Update DB and notify
        await this.chatRepo.upsertPresence(userId, false, new Date());
        return true; // Transited offline
      }
    } catch (err) {
      this.logger.warn(`Failed to track user disconnect for ${userId}: ${err.message}`);
    }
    return false;
  }

  // --- TYPING STATUS ---

  async setUserTyping(conversationId: string, userId: string, isTyping: boolean) {
    const key = `chat:typing:${conversationId}:${userId}`;
    if (isTyping) {
      // Set key with 5s expiration to handle auto-timeout
      await this.redis.set(key, '1', 'EX', 5);
    } else {
      await this.redis.del(key);
    }
  }

  // --- ATTACHMENTS (AWS S3) ---

  async generateUploadUrl(userId: string, fileName: string, fileType: string) {
    return this.s3Service.generatePresignedUploadUrl(userId, fileName, 'chat-attachments', fileType);
  }

  async registerAttachment(messageId: string, dto: CreateAttachmentDto) {
    return await (this.chatRepo as any).prisma.messageAttachment.create({
      data: {
        messageId,
        originalUrl: dto.originalUrl,
        thumbnailUrl: dto.thumbnailUrl || null,
        mimeType: dto.mimeType || null,
        fileSize: dto.fileSize || null,
        width: dto.width || null,
        height: dto.height || null,
        duration: dto.duration || null,
      },
    });
  }

  async searchMessages(userId: string, queryDto: SearchMessagesQueryDto) {
    if (queryDto.conversationId) {
      // Validate participation
      const conversation = await this.chatRepo.findConversationDetails(queryDto.conversationId, userId);
      if (!conversation) {
        throw new ForbiddenException('Access denied to search in this conversation');
      }
    }

    return this.chatRepo.searchMessages({
      keyword: queryDto.keyword,
      conversationId: queryDto.conversationId,
      senderId: queryDto.senderId,
      startDate: queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      endDate: queryDto.endDate ? new Date(queryDto.endDate) : undefined,
    });
  }
}
