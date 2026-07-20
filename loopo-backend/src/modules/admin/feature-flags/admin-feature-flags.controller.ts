import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeatureFlagsService } from './admin-feature-flags.service';
import { BulkUpdateFeatureFlagsDto } from './dto/feature-flag.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Feature Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/feature-flags')
export class AdminFeatureFlagsController {
  constructor(private readonly featureFlagsService: AdminFeatureFlagsService) {}

  @Get()
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Get all feature flags' })
  @ApiResponse({ status: 200, description: 'Return all feature flags' })
  async getFeatureFlags() {
    return this.featureFlagsService.getAllFeatureFlags();
  }

  @Put()
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Bulk update feature flags' })
  @ApiResponse({ status: 200, description: 'Feature flags updated successfully' })
  async updateFeatureFlags(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkUpdateFeatureFlagsDto,
  ) {
    return this.featureFlagsService.bulkUpdateFeatureFlags(userId, dto);
  }
}
