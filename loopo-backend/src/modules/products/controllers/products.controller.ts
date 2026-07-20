import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, ListingSearchQueryDto } from '../dto/product.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';
import { ProductStatus } from '@prisma/client';

@ApiTags('Products & Listings')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.create')
  @LogAudit('CREATE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Create a new marketplace listing' })
  @ApiResponse({ status: 201, description: 'Listing created successfully and submitted for review.' })
  async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    const product = await this.productsService.createProduct(createProductDto, req.user.id);
    return { message: 'Listing created successfully', data: product };
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.update')
  @LogAudit('UPDATE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Update an existing listing' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    const product = await this.productsService.updateProduct(id, updateProductDto, req.user.id);
    return { message: 'Listing updated successfully', data: product };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.delete')
  @LogAudit('DELETE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Delete a listing (soft delete)' })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const result = await this.productsService.deleteProduct(id, req.user.id);
    return { message: 'Listing deleted successfully', data: result };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search and query public listings' })
  @ApiResponse({ status: 200, description: 'Paginated list of approved products.' })
  async findAll(@Query() query: ListingSearchQueryDto) {
    const result = await this.productsService.findPublicListings(query);
    return { message: 'Listings retrieved successfully', data: result };
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.view')
  @ApiOperation({ summary: 'Retrieve own listings' })
  @ApiResponse({ status: 200, description: 'Sellers list of listings.' })
  async findMy(@Query() query: ListingSearchQueryDto, @Request() req: any) {
    const result = await this.productsService.getMyListings(req.user.id, query);
    return { message: 'Your listings retrieved successfully', data: result };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get listing details by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Listing detailed information.' })
  @ApiResponse({ status: 404, description: 'Listing not found.' })
  async findOne(
    @Param('id') idOrSlug: string,
    @Request() req: any,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const userId = req.user?.id || null;
    const product = await this.productsService.viewListing(idOrSlug, userId, ipAddress, userAgent);
    return { message: 'Listing details retrieved successfully', data: product };
  }

  @Patch(':id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.update')
  @LogAudit('PUBLISH_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Submit listing to Pending approval review' })
  async publish(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.updateProduct(id, { status: ProductStatus.PENDING } as any, req.user.id);
    return { message: 'Listing submitted for approval successfully', data: product };
  }

  @Patch(':id/archive')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.update')
  @LogAudit('ARCHIVE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Archive an active listing' })
  async archive(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.updateProduct(id, { status: ProductStatus.ARCHIVED } as any, req.user.id);
    return { message: 'Listing archived successfully', data: product };
  }

  @Patch(':id/pause')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.update')
  @LogAudit('PAUSE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Pause an active listing' })
  async pause(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.updateProduct(id, { status: ProductStatus.PAUSED } as any, req.user.id);
    return { message: 'Listing paused successfully', data: product };
  }

  @Patch(':id/resume')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.update')
  @LogAudit('RESUME_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Resume a paused listing (returns to Pending review)' })
  async resume(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.updateProduct(id, { status: ProductStatus.PENDING } as any, req.user.id);
    return { message: 'Listing resumed to review successfully', data: product };
  }

  @Patch(':id/renew')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.update')
  @LogAudit('RENEW_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Renew an expired listing (re-publishes for 30 days)' })
  async renew(@Param('id') id: string, @Request() req: any) {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 30);

    const product = await this.productsService.updateProduct(
      id,
      { status: ProductStatus.PENDING, expiresAt } as any,
      req.user.id,
    );
    return { message: 'Listing renewed and submitted for review successfully', data: product };
  }

  @Post(':id/duplicate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Permissions('products.create')
  @LogAudit('DUPLICATE_PRODUCT', 'Product')
  @ApiOperation({ summary: 'Duplicate an existing listing as Draft' })
  async duplicate(@Param('id') id: string, @Request() req: any) {
    const product = await this.productsService.getListingDetails(id);
    if (product.sellerId !== req.user.id) {
      throw new ForbiddenException('You do not own this listing');
    }

    const duplicated = await this.productsService.createProduct({
      title: `Copy of ${product.title}`,
      description: product.description,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || undefined,
      condition: product.condition,
      price: product.price,
      currency: product.currency,
      negotiable: product.negotiable,
      quantity: product.quantity,
      location: {
        country: product.location?.country || 'India',
        state: product.location?.state || '',
        city: product.location?.city || '',
        area: product.location?.area || undefined,
        zipCode: product.location?.zipCode || undefined,
        latitude: product.location?.latitude || undefined,
        longitude: product.location?.longitude || undefined,
      },
      attributes: product.attributes.map((a: any) => ({ attributeId: a.attributeId, value: a.value })),
    }, req.user.id);

    return { message: 'Listing duplicated as draft successfully', data: duplicated };
  }
}
