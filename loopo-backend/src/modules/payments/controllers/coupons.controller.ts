import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Coupons')
@Controller()
export class CouponsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Apply promotional coupon to purchase amount' })
  @ApiResponse({ status: 200, description: 'Calculated discount outcome' })
  @Post('coupons/apply')
  async applyCoupon(@CurrentUser() user: any, @Body() dto: ApplyCouponDto) {
    return this.paymentsService.applyCoupon(user.id, dto);
  }

  // --- ADMIN COUPON MANAGEMENT ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'List all coupons (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of coupons retrieved' })
  @Get('admin/coupons')
  async getAdminCoupons() {
    return this.paymentsRepository.prisma.coupon.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Create new promo coupon (Admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  @Post('admin/coupons')
  async createCoupon(@Body() dto: CreateCouponDto) {
    // Check if code already exists
    const existing = await this.paymentsRepository.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing && !existing.deletedAt) {
      throw new BadRequestException(`Coupon code '${dto.code}' already exists`);
    }

    return this.paymentsRepository.prisma.coupon.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        value: dto.value,
        minPurchase: dto.minPurchase ?? null,
        maxDiscount: dto.maxDiscount ?? null,
        usageLimit: dto.usageLimit ?? null,
        perUserLimit: dto.perUserLimit ?? 1,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: true,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Update promo coupon (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  @Put('admin/coupons/:id')
  async updateCoupon(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    const coupon = await this.paymentsRepository.prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon || coupon.deletedAt) {
      throw new NotFoundException('Coupon not found');
    }

    return this.paymentsRepository.prisma.coupon.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        value: dto.value,
        minPurchase: dto.minPurchase,
        maxDiscount: dto.maxDiscount,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Delete promo coupon (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  @Delete('admin/coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    const coupon = await this.paymentsRepository.prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon || coupon.deletedAt) {
      throw new NotFoundException('Coupon not found');
    }

    // Soft delete
    return this.paymentsRepository.prisma.coupon.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
