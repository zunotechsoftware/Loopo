import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';

// This controller had NO guards at all - every route (including create,
// update, and delete on the system-wide notification broadcast list) was
// reachable by a completely unauthenticated request. Confirmed live before
// fixing: `curl -X POST .../admin/notifications` with no Authorization
// header successfully created a real notification record (201). Every
// other admin controller in this codebase uses this exact guard stack -
// this one was simply missing it.
@ApiTags('Admin - Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Permissions('admin.notifications.manage')
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

  @Get('analytics')
  getAnalytics() {
    return this.notificationsService.getAnalytics();
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
