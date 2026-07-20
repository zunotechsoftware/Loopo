import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { RedisService } from '../../../shared/redis/redis.service';
import { PurchaseFeaturedDto } from '../dto/purchase-featured.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Featured Listings')
@Controller('featured')
export class FeaturedController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({ summary: 'Get available featured packages' })
  @ApiResponse({ status: 200, description: 'List of featured packages' })
  @Get('packages')
  async getFeaturedPackages() {
    const cacheKey = 'featured:packages';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const packages = await this.paymentsRepository.findFeaturedPackages();
    await this.redisService.set(cacheKey, JSON.stringify(packages), 3600); // 1 hour TTL
    return packages;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Initiate purchase of a featured listing package' })
  @ApiResponse({ status: 201, description: 'Payment intent/order details returned' })
  @Post('purchase')
  async purchaseFeatured(
    @CurrentUser() user: any,
    @Body() dto: PurchaseFeaturedDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    // Retrieve the package details
    const pkg = await this.paymentsRepository.findFeaturedPackageById(dto.packageId);
    if (!pkg || !pkg.isActive) {
      throw new Error('Featured package not found or inactive');
    }

    // Direct checkout logic
    return this.paymentsService.createPayment(
      user.id,
      {
        amount: pkg.price,
        currency: pkg.currency,
        provider: dto.provider,
        couponCode: dto.couponCode,
        featuredPackageId: pkg.id,
        productId: dto.productId,
      },
      ipAddress,
      userAgent,
    );
  }
}
