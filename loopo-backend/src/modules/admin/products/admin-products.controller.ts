import { Controller, Get, Patch, Param, Body, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminProductsService } from './admin-products.service';
import { AdminUpdateProductDto } from './dto/admin-product.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { ProductStatus, ProductCondition } from '@prisma/client';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/products')
export class AdminProductsManagementController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'subcategoryId', required: false, type: String })
  @ApiQuery({ name: 'condition', required: false, enum: ProductCondition })
  @ApiQuery({ name: 'location', required: false, type: String })
  async getProducts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: ProductStatus,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('condition') condition?: ProductCondition,
    @Query('location') location?: string,
  ) {
    return this.adminProductsService.getAllProducts(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
      search,
      categoryId,
      subcategoryId,
      condition,
      location,
    );
  }

  @Get('stats')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Get product statistics' })
  async getProductsStats() {
    const stats = await this.adminProductsService.getProductsStats();
    return { data: stats };
  }

  @Get('locations')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Get distinct product locations' })
  async getLocations() {
    const locations = await this.adminProductsService.getDistinctLocations();
    return { data: locations };
  }

  @Patch(':id')
  @Permissions('admin.products.manage')
  @ApiOperation({ summary: 'Update product details' })
  async updateProduct(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminUpdateProductDto,
  ) {
    return this.adminProductsService.updateProductDetails(id, adminId, dto);
  }

  // approve/reject/feature/boost were deliberately removed from here, not
  // just left as dead code: ProductsModule registers before AdminModule in
  // app.module.ts, so products/controllers/admin-products.controller.ts's
  // identically-pathed PATCH :id/approve|reject|feature|boost routes were
  // always registered first and permanently shadowed these ones - these
  // handlers, their DTOs (RejectProductDto/FeatureProductDto/BoostProductDto),
  // and the now-unused AdminProductsService methods they called
  // (updateProductStatus/featureProduct/boostProduct) could never actually
  // run. See known-issues.md for the investigation.

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
