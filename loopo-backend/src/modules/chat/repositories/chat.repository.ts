import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { MessageType, MessageStatus, Prisma } from '@prisma/client';
import { CreateAttachmentDto } from '../dto/message.dto';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConversation(productId: string, buyerId: string, sellerId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        productId,
        buyerId,
        sellerId,
        deletedAt: null,
      },
      include: {
        participants: true,
      },
    });
  }

  async createConversation(productId: string, buyerId: string, sellerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          productId,
          buyerId,
          sellerId,
        },
      });

      // Create participants
      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conversation.id, userId: buyerId },
          { conversationId: conversation.id, userId: sellerId },
        ],
      });

      // Create settings for both participants
      await tx.conversationSetting.createMany({
        data: [
          { conversationId: conversation.id, userId: buyerId },
          { conversationId: conversation.id, userId: sellerId },
        ],
      });

      return tx.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          participants: true,
        },
      });
    });
  }

  async findUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            deletedAt: null,
          },
        },
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
            },
          },
        },
        participants: true,
        settings: {
          where: {
            userId,
          },
        },
        messages: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            attachments: true,
          },
        },
      },
    });
  }

  async findConversationDetails(conversationId: string, userId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
        deletedAt: null,
      },
      include: {
        product: true,
        participants: true,
        settings: {
          where: {
            userId,
          },
        },
      },
    });
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    type: MessageType;
    content: string;
    attachments?: CreateAttachmentDto[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          type: data.type,
          content: data.content,
          status: MessageStatus.SENT,
          attachments: data.attachments
            ? {
                createMany: {
                  data: data.attachments.map((att) => ({
                    originalUrl: att.originalUrl,
                    thumbnailUrl: att.thumbnailUrl || null,
                    mimeType: att.mimeType || null,
                    fileSize: att.fileSize || null,
                    width: att.width || null,
                    height: att.height || null,
                    duration: att.duration || null,
                  })),
                },
              }
            : undefined,
        },
        include: {
          attachments: true,
        },
      });

      // Update conversation's updatedAt timestamp
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  async getConversationMessages(conversationId: string, limit: number, offset: number) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        attachments: true,
        reads: true,
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    return this.prisma.message.update({
      where: {
        id: messageId,
        senderId: userId,
      },
      data: {
        deletedAt: new Date(),
        status: MessageStatus.DELETED,
      },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
  }

  async markMessagesAsRead(conversationId: string, readerId: string) {
    const now = new Date();
    
    return this.prisma.$transaction(async (tx) => {
      await tx.message.updateMany({
        where: {
          conversationId,
          senderId: { not: readerId },
          status: { in: [MessageStatus.SENT, MessageStatus.DELIVERED] },
        },
        data: {
          status: MessageStatus.READ,
        },
      });

      const unreadMessages = await tx.message.findMany({
        where: {
          conversationId,
          senderId: { not: readerId },
        },
        select: { id: true },
      });

      for (const msg of unreadMessages) {
        await tx.messageRead.upsert({
          where: {
            messageId_userId: {
              messageId: msg.id,
              userId: readerId,
            },
          },
          update: {
            readAt: now,
          },
          create: {
            messageId: msg.id,
            userId: readerId,
            readAt: now,
            deliveredAt: now,
          },
        });
      }

      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: readerId,
          },
        },
        data: {
          lastReadAt: now,
        },
      });
    });
  }

  async markMessagesAsDelivered(conversationId: string, recipientId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sentMessages = await tx.message.findMany({
        where: {
          conversationId,
          senderId: { not: recipientId },
          status: MessageStatus.SENT,
        },
      });

      await tx.message.updateMany({
        where: {
          conversationId,
          senderId: { not: recipientId },
          status: MessageStatus.SENT,
        },
        data: {
          status: MessageStatus.DELIVERED,
        },
      });

      for (const msg of sentMessages) {
        await tx.messageRead.upsert({
          where: {
            messageId_userId: {
              messageId: msg.id,
              userId: recipientId,
            },
          },
          update: {
            deliveredAt: new Date(),
          },
          create: {
            messageId: msg.id,
            userId: recipientId,
            deliveredAt: new Date(),
          },
        });
      }
    });
  }

  async upsertPresence(userId: string, isOnline: boolean, lastSeenAt = new Date()) {
    return this.prisma.userPresence.upsert({
      where: { userId },
      update: { isOnline, lastSeenAt },
      create: { userId, isOnline, lastSeenAt },
    });
  }

  async getPresence(userId: string) {
    return this.prisma.userPresence.findUnique({
      where: { userId },
    });
  }

  async blockUser(blockerId: string, blockedId: string) {
    return this.prisma.blockedUser.upsert({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
      update: {},
      create: { blockerId, blockedId },
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    return this.prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
  }

  async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    const block = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 },
          { blockerId: userId2, blockedId: userId1 },
        ],
      },
    });
    return !!block;
  }

  async updateConversationSettings(
    conversationId: string,
    userId: string,
    data: { isMuted?: boolean; isPinned?: boolean; isArchived?: boolean; mutedUntil?: Date | null },
  ) {
    return this.prisma.conversationSetting.upsert({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      update: data,
      create: {
        conversationId,
        userId,
        ...data,
      },
    });
  }

  async searchMessages(params: {
    keyword: string;
    conversationId?: string;
    senderId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.MessageWhereInput = {
      content: {
        contains: params.keyword,
        mode: 'insensitive',
      },
      deletedAt: null,
    };

    if (params.conversationId) {
      where.conversationId = params.conversationId;
    }
    if (params.senderId) {
      where.senderId = params.senderId;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.createdAt.lte = params.endDate;
      }
    }

    return this.prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        attachments: true,
      },
    });
  }
}
