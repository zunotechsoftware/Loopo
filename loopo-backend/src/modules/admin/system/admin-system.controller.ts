import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSystemService } from './admin-system.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';

@ApiTags('Admin - System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/system')
export class AdminSystemController {
  constructor(private readonly systemService: AdminSystemService) {}

  @Get('health')
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Get system health' })
  async getHealth() {
    return this.systemService.getHealthStatus();
  }

  @Get('version')
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Get system version and environment info' })
  async getVersion() {
    return this.systemService.getVersionInfo();
  }

  @Get('queues')
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Get background job queues status' })
  async getQueues() {
    return this.systemService.getQueueStatus();
  }
}
