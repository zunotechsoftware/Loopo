import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { UserNotificationsService } from '../services/user-notifications.service';

/** Every authenticated user's own notification inbox - buyers, sellers and
 * admins alike. No role/permission gating beyond "is logged in": a user
 * only ever reads their own rows (`req.user.id`), so there is nothing here
 * for RolesGuard/PermissionsGuard to usefully restrict. */
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class UserNotificationsController {
  constructor(private readonly notificationsService: UserNotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated user's notifications" })
  findMine(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findMyNotifications(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Patch('read-all')
  @ApiOperation({ summary: "Mark all of the authenticated user's notifications as read" })
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.id, id);
  }
}
