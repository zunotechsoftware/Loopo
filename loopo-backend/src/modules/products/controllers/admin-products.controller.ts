import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { RejectProductDto, FeatureProductDto, BoostProductDto, ListingSearchQueryDto } from '../dto/product.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';
import { ProductStatus } from '@prisma/client';

@ApiTags('Admin Products & Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('pending')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('products.approve', 'products.reject')
  @ApiOperation({ summary: 'Get listings pending moderator approval' })
  @ApiResponse({ status: 200, description: 'Paginated list of pending items.' })
  async findPending(@Query() query: ListingSearchQueryDto) {
    // Override query status to PENDING for moderation queries
    query.status = ProductStatus.PENDING;
    const result = await this.productsService.findPublicListings(query);
    return { message: 'Pending listings retrieved successfully', data: result };
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('products.approve')
  @LogAudit('APPROVE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Approve a pending listing' })
  @ApiResponse({ status: 200, description: 'Listing approved and is now public.' })
  async approve(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.approveProduct(id, req.user.id);
    return { message: 'Listing approved successfully', data: product };
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('products.reject')
  @LogAudit('REJECT_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Reject a pending listing' })
  @ApiResponse({ status: 200, description: 'Listing rejected.' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectProductDto,
    @Request() req: any,
  ) {
    const product = await this.productsService.rejectProduct(id, rejectDto.reason, req.user.id);
    return { message: 'Listing rejected successfully', data: product };
  }

  @Patch(':id/suspend')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('products.reject')
  @LogAudit('SUSPEND_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Suspend an active listing' })
  @ApiResponse({ status: 200, description: 'Listing suspended (marked as Rejected).' })
  async suspend(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.rejectProduct(id, 'Listing suspended for security or TOS violation', req.user.id);
    return { message: 'Listing suspended successfully', data: product };
  }

  @Patch(':id/feature')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('products.feature')
  @LogAudit('FEATURE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Promote listing as Featured' })
  @ApiResponse({ status: 200, description: 'Listing promoted.' })
  async feature(
    @Param('id') id: string,
    @Body() featureDto: FeatureProductDto,
  ) {
    const product = await this.productsService.promoteFeatured(id, featureDto.durationDays);
    return { message: 'Listing featured successfully', data: product };
  }

  @Patch(':id/boost')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('products.boost')
  @LogAudit('BOOST_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Promote listing as Boosted' })
  @ApiResponse({ status: 200, description: 'Listing boosted.' })
  async boost(
    @Param('id') id: string,
    @Body() boostDto: BoostProductDto,
  ) {
    const product = await this.productsService.promoteBoost(id, boostDto.packageName);
    return { message: 'Listing boosted successfully', data: product };
  }
}
