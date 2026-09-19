import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { SocketEmitterService } from '../../../shared/websocket/socket-emitter.service';

export interface NotifyPayload {
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/** The four audience labels loopo-admin's broadcast composer already shows
 * in its UI - previously just saved as a free-text string with no real
 * targeting behind it at all. */
export type Audience = 'All' | 'Sellers' | 'Buyers' | 'Segmented';

@Injectable()
export class UserNotificationsService {
  private readonly logger = new Logger(UserNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketEmitter: SocketEmitterService,
  ) {}

  async notifyUser(userId: string, payload: NotifyPayload) {
    const notification = await this.prisma.userNotification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        metadata: payload.metadata as any,
      },
    });
    this.socketEmitter.emitToUser(userId, 'notification:new', notification);
    return notification;
  }

  /** Bulk fan-out for admin broadcasts and role-wide pings (e.g. "notify
   * every admin a listing needs review"). Uses createMany for the DB write
   * since audiences can be large, then emits individually so every
   * connected socket still gets a real-time push. */
  async notifyUsers(userIds: string[], payload: NotifyPayload): Promise<number> {
    const uniqueIds = Array.from(new Set(userIds));
    if (uniqueIds.length === 0) return 0;

    await this.prisma.userNotification.createMany({
      data: uniqueIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        metadata: payload.metadata as any,
      })),
    });

    const createdAt = new Date().toISOString();
    for (const userId of uniqueIds) {
      this.socketEmitter.emitToUser(userId, 'notification:new', { ...payload, createdAt });
    }

    return uniqueIds.length;
  }

  /** ADMIN and SUPER_ADMIN are both real staff roles - a listing awaiting
   * review should reach either, not just whichever one happens to be on
   * shift. */
  async notifyAdmins(payload: NotifyPayload): Promise<number> {
    const admins = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        roles: { some: { role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } } } },
      },
      select: { id: true },
    });
    if (admins.length === 0) {
      this.logger.warn(`notifyAdmins: no ADMIN/SUPER_ADMIN users found - "${payload.title}" was not delivered to anyone`);
    }
    return this.notifyUsers(admins.map((a) => a.id), payload);
  }

  /** Resolves the admin broadcast composer's audience label into real user
   * ids. There is no seller "role" or flag anywhere in this schema - a
   * seller is any user who has ever listed a product
   * (`products: { some: {} }`); a buyer is everyone else. This mirrors the
   * same seller-detection rule already used elsewhere in this codebase
   * rather than relying on the unused, never-created SellerProfile row. */
  async resolveAudience(audience: string, targetUserIds?: string[]): Promise<string[]> {
    const normalized = (audience || '').trim().toLowerCase();

    if (normalized.startsWith('segmented')) {
      return (targetUserIds || []).filter(Boolean);
    }

    if (normalized.startsWith('seller')) {
      const sellers = await this.prisma.user.findMany({
        where: { deletedAt: null, products: { some: {} } },
        select: { id: true },
      });
      return sellers.map((u) => u.id);
    }

    if (normalized.startsWith('buyer')) {
      const buyers = await this.prisma.user.findMany({
        where: { deletedAt: null, products: { none: {} } },
        select: { id: true },
      });
      return buyers.map((u) => u.id);
    }

    // 'All' (or anything unrecognised) - every non-deleted user.
    const all = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    return all.map((u) => u.id);
  }

  async findMyNotifications(userId: string, page: number, limit: number) {
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 && limit <= 100 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.userNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.userNotification.count({ where: { userId } }),
      this.prisma.userNotification.count({ where: { userId, isRead: false } }),
    ]);

    return { items, total, unreadCount };
  }

  async markRead(userId: string, id: string) {
    const result = await this.prisma.userNotification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async deleteOne(userId: string, id: string) {
    const result = await this.prisma.userNotification.deleteMany({ where: { id, userId } });
    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { success: true };
  }

  /// Backs "Clear all" - both loopo-client's and loopo-flutter's
  /// notification screens already had this button, but it only ever
  /// cleared local in-memory state; the real rows still existed and would
  /// reappear on the next fetch.
  async deleteAll(userId: string) {
    await this.prisma.userNotification.deleteMany({ where: { userId } });
    return { success: true };
  }
}
