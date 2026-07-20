import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminNotificationsService } from './admin-notifications.service';
import { BroadcastNotificationDto } from './dto/admin-notification.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: AdminNotificationsService) {}

  @Post('broadcast')
  @Permissions('admin.notifications.manage')
  @ApiOperation({ summary: 'Broadcast a notification to users' })
  async broadcastNotification(
    @CurrentUser('id') adminId: string,
    @Body() dto: BroadcastNotificationDto,
  ) {
    return this.notificationsService.broadcastNotification(adminId, dto);
  }

  @Get('announcements')
  @Permissions('admin.notifications.manage')
  @ApiOperation({ summary: 'Get all system announcements' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAnnouncements(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.getAllAnnouncements(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
    );
  }
}
