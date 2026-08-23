import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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

  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data,
    });
  }

  async update(id: string, data: UpdateNotificationDto) {
    await this.findOne(id); // verify existence
    return this.prisma.notification.update({
      where: { id },
      data,
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
}
