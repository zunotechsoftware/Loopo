import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsQueryService } from '../services/analytics-query.service';
import { AnalyticsQueryDto, ProductAnalyticsQueryDto } from '../dto/analytics.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly queryService: AnalyticsQueryService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get overall admin analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics returned successfully' })
  async getDashboard(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getAdminDashboard(query);
  }

  @Get('search')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get search analytics' })
  async getSearchAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getSearchAnalytics(query);
  }

  @Get('categories')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get category analytics' })
  async getCategoryAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getCategoryAnalytics(query);
  }

  @Get('payments')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get payment analytics' })
  async getPaymentAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getPaymentAnalytics(query);
  }
}

@ApiTags('Product Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/products')
export class ProductAnalyticsController {
  constructor(private readonly queryService: AnalyticsQueryService) {}

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get product specific analytics' })
  @ApiResponse({ status: 200, description: 'Product analytics returned successfully' })
  async getProductAnalytics(
    @Param('id') id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    // In a real implementation, we should check if the user is the seller of the product or an admin.
    return this.queryService.getProductAnalytics(id, query);
  }
}

@ApiTags('Search Analytics')
@Controller('v1/search/analytics')
export class SearchAnalyticsController {
  constructor(private readonly queryService: AnalyticsQueryService) {}

  @Get()
  @ApiOperation({ summary: 'Get public trending search analytics' })
  async getSearchAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getSearchAnalytics(query);
  }
}

@ApiTags('Category Analytics')
@Controller('v1/categories/analytics')
export class CategoryAnalyticsController {
  constructor(private readonly queryService: AnalyticsQueryService) {}

  @Get()
  @ApiOperation({ summary: 'Get public trending category analytics' })
  async getCategoryAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getCategoryAnalytics(query);
  }
}

@ApiTags('Payment Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/payments/analytics')
export class PaymentAnalyticsController {
  constructor(private readonly queryService: AnalyticsQueryService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get payment analytics' })
  async getPaymentAnalytics(@Query() query: AnalyticsQueryDto) {
    return this.queryService.getPaymentAnalytics(query);
  }
}
