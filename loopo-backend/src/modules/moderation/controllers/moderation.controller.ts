import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ModerationService } from '../services/moderation.service';
import { WarnUserDto } from '../dto/warn-user.dto';
import { SuspendUserDto } from '../dto/suspend-user.dto';
import { BanUserDto } from '../dto/ban-user.dto';
import { HideListingDto } from '../dto/hide-listing.dto';
import { DeleteListingDto } from '../dto/delete-listing.dto';
import { DeleteMessageDto } from '../dto/delete-message.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Moderation')
@Controller('admin/moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Permissions('moderation.manage')
  @ApiOperation({ summary: 'Issue warning to a user and log to strike thresholds' })
  @ApiResponse({ status: 201, description: 'Warning logged successfully' })
  @Post('warn-user')
  async warnUser(@CurrentUser() user: any, @Body() dto: WarnUserDto) {
    return this.moderationService.warnUser(user.id, dto);
  }

  @Permissions('users.suspend')
  @ApiOperation({ summary: 'Temporarily suspend a user account' })
  @ApiResponse({ status: 201, description: 'User suspended' })
  @Post('suspend-user')
  async suspendUser(@CurrentUser() user: any, @Body() dto: SuspendUserDto) {
    return this.moderationService.suspendUser(user.id, dto);
  }

  @Permissions('users.ban')
  @ApiOperation({ summary: 'Permanently ban and blacklist a user' })
  @ApiResponse({ status: 201, description: 'User permanently banned' })
  @Post('ban-user')
  async banUser(@CurrentUser() user: any, @Body() dto: BanUserDto) {
    return this.moderationService.banUser(user.id, dto);
  }

  @Permissions('products.suspend')
  @ApiOperation({ summary: 'Temporarily hide a product listing from search results' })
  @ApiResponse({ status: 201, description: 'Listing hidden successfully' })
  @Post('hide-listing')
  async hideListing(@CurrentUser() user: any, @Body() dto: HideListingDto) {
    return this.moderationService.hideListing(user.id, dto);
  }

  @Permissions('moderation.manage')
  @ApiOperation({ summary: 'Remove a product listing permanently' })
  @ApiResponse({ status: 201, description: 'Listing deleted successfully' })
  @Post('delete-listing')
  async deleteListing(@CurrentUser() user: any, @Body() dto: DeleteListingDto) {
    return this.moderationService.deleteListing(user.id, dto);
  }

  @Permissions('moderation.manage')
  @ApiOperation({ summary: 'Redact/delete a violating chat message content' })
  @ApiResponse({ status: 201, description: 'Message deleted successfully' })
  @Post('delete-message')
  async deleteMessage(@CurrentUser() user: any, @Body() dto: DeleteMessageDto) {
    return this.moderationService.deleteChatMessage(user.id, dto);
  }

  @Permissions('reports.view')
  @ApiOperation({ summary: 'Get overall moderation analytics statistics' })
  @ApiResponse({ status: 200, description: 'Analytics payload' })
  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.moderationService.getModerationDashboardStats();
  }
}
