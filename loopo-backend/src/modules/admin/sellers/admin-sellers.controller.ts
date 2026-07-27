import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSellersService } from './admin-sellers.service';
import { AdminSellerQueryDto } from './dto/admin-seller.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';

@ApiTags('Admin - Sellers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/sellers')
export class AdminSellersController {
  constructor(private readonly service: AdminSellersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.view')
  @ApiOperation({ summary: 'Get all sellers' })
  @ApiResponse({ status: 200, description: 'Sellers list retrieved successfully' })
  async getSellers(@Query() query: AdminSellerQueryDto) {
    return this.service.listSellers(query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.view')
  @ApiOperation({ summary: 'Get seller details by ID' })
  @ApiResponse({ status: 200, description: 'Seller profile details retrieved successfully' })
  async getSellerDetails(@Param('id') id: string) {
    return this.service.getSellerById(id);
  }

  @Patch(':id/verify')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.update')
  @LogAudit('VERIFY_SELLER', 'SellerProfile')
  @ApiOperation({ summary: 'Verify a seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile verified successfully' })
  async verifySeller(@Param('id') id: string) {
    return this.service.verifySeller(id);
  }

  @Patch(':id/suspend')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.suspend')
  @LogAudit('SUSPEND_SELLER', 'SellerProfile')
  @ApiOperation({ summary: 'Suspend a seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile suspended successfully' })
  async suspendSeller(@Param('id') id: string) {
    return this.service.suspendSeller(id);
  }

  @Patch(':id/approve-kyc')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('kyc.review')
  @LogAudit('APPROVE_KYC', 'KycDocument')
  @ApiOperation({ summary: 'Approve KYC document for a seller and verify profile' })
  @ApiResponse({ status: 200, description: 'Seller KYC approved successfully' })
  async approveKyc(@Param('id') id: string) {
    return this.service.approveKyc(id);
  }
}
