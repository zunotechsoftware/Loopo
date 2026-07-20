import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminSettingsService } from './admin-settings.service';
import { UpdateSystemSettingDto, BulkUpdateSettingsDto } from './dto/system-settings.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({ status: 200, description: 'Return all settings' })
  @ApiQuery({ name: 'group', required: false, type: String })
  async getSettings(@Query('group') group?: string) {
    return this.settingsService.getAllSettings(group);
  }

  @Put()
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Bulk update system settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkUpdateSettingsDto,
  ) {
    return this.settingsService.bulkUpdateSettings(userId, dto);
  }
}
