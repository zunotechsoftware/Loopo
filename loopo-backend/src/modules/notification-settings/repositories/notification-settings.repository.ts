import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class NotificationSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.notificationSetting.findUnique({
      where: { userId },
    });
  }

  async create(userId: string) {
    return this.prisma.notificationSetting.create({
      data: {
        userId,
        createdBy: userId,
      },
    });
  }

  async update(userId: string, data: any) {
    return this.prisma.notificationSetting.update({
      where: { userId },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }
}
