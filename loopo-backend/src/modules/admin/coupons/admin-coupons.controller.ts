import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCouponsService } from './admin-coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupons.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';

@ApiTags('Admin - Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: AdminCouponsService) {}

  @Get()
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Get all coupons' })
  async getCoupons() {
    return this.couponsService.getAllCoupons();
  }

  @Get(':id')
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Get a coupon by ID' })
  async getCouponById(@Param('id') id: string) {
    return this.couponsService.getCouponById(id);
  }

  @Post()
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Create a new coupon' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }

  @Put(':id')
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Update a coupon' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  async updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.updateCoupon(id, dto);
  }

  @Delete(':id')
  @Permissions('coupons.manage')
  @ApiOperation({ summary: 'Delete a coupon' })
  async deleteCoupon(@Param('id') id: string) {
    return this.couponsService.deleteCoupon(id);
  }
}
