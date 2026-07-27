import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateAdminCategoryDto, UpdateAdminCategoryDto, AdminCategoryQueryDto } from './dto/admin-category.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Get()
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Get all categories with filters' })
  async getCategories(@Query() query: AdminCategoryQueryDto) {
    return this.categoriesService.getAllCategories(query);
  }

  @Get('stats')
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Get category summary metrics' })
  async getStats() {
    return this.categoriesService.getCategoriesStats();
  }

  @Get(':id')
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Get category by ID' })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }


  @Post()
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Create a category' })
  async createCategory(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateAdminCategoryDto,
  ) {
    return this.categoriesService.createCategory(adminId, dto);
  }

  @Put(':id')
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateAdminCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, adminId, dto);
  }

  @Delete(':id')
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.categoriesService.deleteCategory(id, adminId);
  }
}
