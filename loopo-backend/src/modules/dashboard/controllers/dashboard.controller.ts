import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('User Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Get dashboard summary for the logged in seller/user' })
  @ApiResponse({ status: 200, description: 'Dashboard summary returned successfully' })
  async getSummary(@Request() req: any) {
    return this.dashboardService.getSellerDashboardSummary(req.user.id);
  }

  @Get('listings')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Get recent listings for the dashboard' })
  async getListings(@Request() req: any) {
    return this.dashboardService.getDashboardListings(req.user.id);
  }

  @Get('views')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Get views over time for the dashboard' })
  async getViews(@Request() req: any) {
    return this.dashboardService.getDashboardViews(req.user.id);
  }

  @Get('chats')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Get recent chats for the dashboard' })
  async getChats(@Request() req: any) {
    return this.dashboardService.getDashboardChats(req.user.id);
  }

  @Get('revenue')
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Get revenue summary for the dashboard' })
  async getRevenue(@Request() req: any) {
    return this.dashboardService.getDashboardRevenue(req.user.id);
  }
}
