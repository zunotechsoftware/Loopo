import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationSettingsService } from '../services/notification-settings.service';
import { UpdateNotificationSettingsDto } from '../dto/notification-settings.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('Notification Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(private readonly settingsService: NotificationSettingsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Get current user\'s notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification settings retrieved successfully.' })
  async getMySettings(@Request() req: any) {
    const settings = await this.settingsService.getSettings(req.user.id);
    return { message: 'Notification settings retrieved successfully', data: settings };
  }

  @Put()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  @ApiOperation({ summary: 'Update current user\'s notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification settings updated successfully.' })
  async updateMySettings(
    @Body() dto: UpdateNotificationSettingsDto,
    @Request() req: any,
  ) {
    const settings = await this.settingsService.updateSettings(req.user.id, dto);
    return { message: 'Notification settings updated successfully', data: settings };
  }
}
