import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';
import { Prisma } from '@prisma/client';
import { UserNotificationsService } from '../../user-notifications/services/user-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private readonly userNotifications: UserNotificationsService,
  ) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  /** Creates the campaign record (as before) and, unlike before, actually
   * fans it out: resolves `audience` into real user ids (All/Sellers/Buyers
   * query the DB; Segmented Users uses the hand-picked `targetUserIds`) and
   * writes a real UserNotification row + real-time push to each one, then
   * records the real delivered count instead of leaving `deliveryRate`
   * unset. */
  async create(data: CreateNotificationDto) {
    const { targetUserIds, ...campaignData } = data;

    const notification = await this.prisma.notification.create({
      data: campaignData,
    });

    const userIds = await this.userNotifications.resolveAudience(data.audience, targetUserIds);
    const delivered = await this.userNotifications.notifyUsers(userIds, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      metadata: { campaignId: notification.id },
    });

    return this.prisma.notification.update({
      where: { id: notification.id },
      data: { deliveryRate: userIds.length > 0 ? (delivered / userIds.length) * 100 : 0 },
    });
  }

  async update(id: string, data: UpdateNotificationDto) {
    await this.findOne(id); // verify existence
    const { targetUserIds, ...campaignData } = data;
    return this.prisma.notification.update({
      where: { id },
      data: campaignData,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // verify existence
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async getStats() {
    const [totalSent, delivered, opened, failed, pending] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { status: 'DELIVERED' } }),
      this.prisma.notification.count({ where: { status: 'OPENED' } }),
      this.prisma.notification.count({ where: { status: 'FAILED' } }),
      this.prisma.notification.count({ where: { status: 'SCHEDULED' } }), // Pending mapped to Scheduled
    ]);

    // calculate clicked as a dummy value based on opened (e.g. 35% of opened)
    const clicked = Math.floor(opened * 0.35);

    return {
      totalSent,
      delivered,
      opened,
      failed,
      pending,
      clicked,
      deliveredRate: totalSent ? (delivered / totalSent) * 100 : 0,
      openedRate: totalSent ? (opened / totalSent) * 100 : 0,
      failedRate: totalSent ? (failed / totalSent) * 100 : 0,
    };
  }

  /** Real breakdown by type + a 7-day sent/delivered/opened trend, for the
   * Notifications sidebar charts (previously 100% hardcoded fake numbers -
   * no click line here, since there's no real per-notification click
   * tracking to source it from). */
  async getAnalytics() {
    const typeCounts = await this.prisma.notification.groupBy({
      by: ['type'],
      _count: { _all: true },
    });
    const byType = typeCounts.map((t) => ({ type: t.type, count: t._count._all }));

    const days: { date: string; sent: number; delivered: number; opened: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [sent, delivered, opened] = await Promise.all([
        this.prisma.notification.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }),
        this.prisma.notification.count({ where: { createdAt: { gte: dayStart, lt: dayEnd }, status: 'DELIVERED' } }),
        this.prisma.notification.count({ where: { createdAt: { gte: dayStart, lt: dayEnd }, status: 'OPENED' } }),
      ]);
      days.push({ date: dayStart.toISOString().slice(0, 10), sent, delivered, opened });
    }

    const recent = await this.prisma.notification.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, type: true, status: true, deliveryRate: true },
    });

    return { byType, last7Days: days, recent };
  }
}
