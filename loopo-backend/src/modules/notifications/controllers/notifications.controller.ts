import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';
import { NotificationStatus, NotificationType } from '@prisma/client';

@Controller('admin/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create({
      ...createNotificationDto,
      status: createNotificationDto.status || NotificationStatus.DELIVERED,
      sentScheduled: createNotificationDto.sentScheduled || new Date().toISOString(),
    });
  }

  @Get('stats')
  getStats() {
    return this.notificationsService.getStats();
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    return this.notificationsService.findAll({
      skip: skip ? +skip : 0,
      take: take ? +take : 100,
      where,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
