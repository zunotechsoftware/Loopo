import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminNotificationsService } from './admin-notifications.service';
import { BroadcastNotificationDto } from './dto/admin-notification.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

// This used to be @Controller('api/v1/admin/notifications') - a redundant
// 'api/v1/' prefix stacking on top of the global prefix made every route
// here permanently unreachable (see known-issues.md). Fixing the prefix
// naively to 'admin/notifications' would have made 'GET /admin/notifications
// /announcements' collide with (and always lose to) the unrelated, already-
// correctly-registered NotificationsController's 'GET /admin/notifications
// /:id' route - Express/Nest match routes in registration order, so
// "announcements" would just be captured as an :id. This is a genuinely
// separate resource (broadcasts + SystemAnnouncement rows, not the
// Notification-model CRUD the other controller manages), so it gets its own
// top-level path instead of nesting under notifications at all.
@ApiTags('Admin - Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/announcements')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: AdminNotificationsService) {}

  @Post()
  @Permissions('admin.notifications.manage')
  @ApiOperation({ summary: 'Broadcast a notification/announcement to users' })
  async broadcastNotification(
    @CurrentUser('id') adminId: string,
    @Body() dto: BroadcastNotificationDto,
  ) {
    return this.notificationsService.broadcastNotification(adminId, dto);
  }

  @Get()
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
