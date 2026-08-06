import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { RedisService } from '../../../shared/redis/redis.service';
import { PurchaseBoostDto } from '../dto/purchase-boost.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Boost Packages')
@Controller('boost')
export class BoostController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({ summary: 'Get available boost packages' })
  @ApiResponse({ status: 200, description: 'List of boost packages' })
  @Get('packages')
  async getBoostPackages() {
    const cacheKey = 'boost:packages';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const packages = await this.paymentsRepository.findBoostPackages();
    await this.redisService.set(cacheKey, JSON.stringify(packages), 3600); // 1 hour TTL
    return packages;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('payments.manage')
  @ApiOperation({ summary: 'Initiate purchase of listing boost credits' })
  @ApiResponse({ status: 201, description: 'Payment intent/order details returned' })
  @Post('purchase')
  async purchaseBoost(
    @CurrentUser() user: any,
    @Body() dto: PurchaseBoostDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const pkg = await this.paymentsRepository.findBoostPackageById(dto.packageId);
    if (!pkg || !pkg.isActive) {
      throw new BadRequestException('Boost package not found or inactive');
    }

    return this.paymentsService.createPayment(
      user.id,
      {
        amount: pkg.price,
        currency: pkg.currency,
        provider: dto.provider,
        couponCode: dto.couponCode,
        boostPackageId: pkg.id,
      },
      ipAddress,
      userAgent,
    );
  }
}
