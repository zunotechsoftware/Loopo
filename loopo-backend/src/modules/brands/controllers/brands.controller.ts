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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BrandsService } from '../services/brands.service';
import {
  CreateBrandDto,
  UpdateBrandDto,
  UpdateBrandStatusDto,
  UpdateBrandFeaturedDto,
} from '../dto/brand.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all brands with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of brands.' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    const result = await this.brandsService.getAllBrands({
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 10,
      search,
      status,
      categoryId,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    });
    return { message: 'Brands retrieved successfully', data: result };
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('brands.view', 'brands.manage')
  @ApiOperation({ summary: 'Get brand statistics' })
  @ApiResponse({ status: 200, description: 'Brand statistics.' })
  async getStats() {
    const stats = await this.brandsService.getStats();
    return { message: 'Brand statistics retrieved successfully', data: stats };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get brand by ID or slug' })
  @ApiResponse({ status: 200, description: 'Brand details.' })
  @ApiResponse({ status: 404, description: 'Brand not found.' })
  async findOne(@Param('id') id: string) {
    const brand = await this.brandsService.getBrand(id);
    return { message: 'Brand details retrieved successfully', data: brand };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('brands.create', 'brands.manage')
  @LogAudit('CREATE_BRAND', 'Brand')
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully.' })
  async create(@Body() createBrandDto: CreateBrandDto, @Request() req: any) {
    const brand = await this.brandsService.createBrand(createBrandDto, req.user.id);
    return { message: 'Brand created successfully', data: brand };
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('brands.update', 'brands.manage')
  @LogAudit('UPDATE_BRAND', 'Brand')
  @ApiOperation({ summary: 'Update an existing brand' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @Request() req: any,
  ) {
    const brand = await this.brandsService.updateBrand(id, updateBrandDto, req.user.id);
    return { message: 'Brand updated successfully', data: brand };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('brands.delete', 'brands.manage')
  @LogAudit('DELETE_BRAND', 'Brand')
  @ApiOperation({ summary: 'Delete a brand (soft delete)' })
  @ApiResponse({ status: 200, description: 'Brand soft deleted.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const result = await this.brandsService.deleteBrand(id, req.user.id);
    return { message: 'Brand deleted successfully', data: result };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('brands.update', 'brands.manage')
  @LogAudit('UPDATE_BRAND_STATUS', 'Brand')
  @ApiOperation({ summary: 'Update brand active status' })
  @ApiResponse({ status: 200, description: 'Brand status updated.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBrandStatusDto,
    @Request() req: any,
  ) {
    const brand = await this.brandsService.updateStatus(id, updateStatusDto.isActive, req.user.id);
    return { message: 'Brand status updated successfully', data: brand };
  }

  @Patch(':id/featured')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('brands.update', 'brands.manage')
  @LogAudit('UPDATE_BRAND_FEATURED', 'Brand')
  @ApiOperation({ summary: 'Toggle brand featured status' })
  @ApiResponse({ status: 200, description: 'Brand featured status updated.' })
  async toggleFeatured(
    @Param('id') id: string,
    @Body() updateFeaturedDto: UpdateBrandFeaturedDto,
    @Request() req: any,
  ) {
    const brand = await this.brandsService.toggleFeatured(id, updateFeaturedDto.isFeatured, req.user.id);
    return { message: 'Brand featured status updated successfully', data: brand };
  }
}
