import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscribeDto } from '../dto/subscribe.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Get all available subscription membership plans' })
  @ApiResponse({ status: 200, description: 'List of subscription plans with limits' })
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Initiate signup/subscription to a plan' })
  @ApiResponse({ status: 201, description: 'Checkout session / payment order details' })
  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: any,
    @Body() dto: SubscribeDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.subscriptionsService.subscribe(user.id, dto, ipAddress, userAgent);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.view')
  @ApiOperation({ summary: 'Get current user active subscription and remaining limits' })
  @ApiResponse({ status: 200, description: 'Subscription details and limits payload' })
  @Get('current')
  async getCurrentSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getCurrentSubscription(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Cancel subscription renewal at end of current period' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @Post('cancel')
  async cancelSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }
}
