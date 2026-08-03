import { Controller, Get, Patch, Param, Body, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminProductsService } from './admin-products.service';
import { RejectProductDto, FeatureProductDto, BoostProductDto } from './dto/admin-product.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ProductStatus } from '@prisma/client';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getProducts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: ProductStatus,
    @Query('search') search?: string,
  ) {
    return this.adminProductsService.getAllProducts(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
      search,
    );
  }

  @Patch(':id/approve')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Approve a product' })
  async approveProduct(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminProductsService.updateProductStatus(id, adminId, 'APPROVED');
  }

  @Patch(':id/reject')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Reject a product' })
  async rejectProduct(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectProductDto,
  ) {
    return this.adminProductsService.updateProductStatus(id, adminId, 'REJECTED', dto.reason);
  }

  @Patch(':id/feature')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Feature a product' })
  async featureProduct(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: FeatureProductDto,
  ) {
    return this.adminProductsService.featureProduct(id, adminId, dto);
  }

  @Patch(':id/boost')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Boost a product' })
  async boostProduct(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: BoostProductDto,
  ) {
    return this.adminProductsService.boostProduct(id, adminId, dto);
  }

  @Delete(':id')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Delete a product' })
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminProductsService.deleteProduct(id, adminId);
  }
}
