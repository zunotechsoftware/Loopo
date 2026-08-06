import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { BroadcastNotificationDto } from './dto/admin-notification.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AdminNotificationsService {
  private readonly logger = new Logger(AdminNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async broadcastNotification(adminId: string, dto: BroadcastNotificationDto) {
    // Determine target users
    let userIds: string[] = [];
    
    if (dto.userIds && dto.userIds.length > 0) {
      userIds = dto.userIds;
    } else if (dto.targetRole && dto.targetRole !== 'ALL') {
      const users = await this.prisma.user.findMany({
        where: {
          roles: { some: { role: { name: dto.targetRole } } },
          deletedAt: null,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    } else {
      // Broadcast to all active users (be careful in production with millions of users!)
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    }

    // Save record to DB for auditing
    const announcement = await this.prisma.systemAnnouncement.create({
      data: {
        title: dto.title,
        message: dto.message,
        targetRole: dto.targetRole || 'ALL',
        createdBy: adminId,
        isActive: true,
      },
    });

    // Enqueue job for background processing
    const delay = dto.scheduledAt ? new Date(dto.scheduledAt).getTime() - Date.now() : 0;
    
    await this.notificationQueue.add(
      'broadcast-notification',
      {
        announcementId: announcement.id,
        title: dto.title,
        message: dto.message,
        channels: dto.channels,
        userIds,
      },
      { delay: Math.max(0, delay) },
    );

    return {
      message: `Notification enqueued for ${userIds.length} users.`,
      announcementId: announcement.id,
    };
  }

  async getAllAnnouncements(skip: number = 0, take: number = 20) {
    return this.prisma.systemAnnouncement.findMany({
      where: { deletedAt: null },
      skip,
      take,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
