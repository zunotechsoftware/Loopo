import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateAdminCategoryDto, UpdateAdminCategoryDto } from './dto/admin-category.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Get()
  @Permissions('admin.categories.manage')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Post()
  @Permissions('admin.categories.manage')
  @ApiOperation({ summary: 'Create a category' })
  async createCategory(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateAdminCategoryDto,
  ) {
    return this.categoriesService.createCategory(adminId, dto);
  }

  @Put(':id')
  @Permissions('admin.categories.manage')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateAdminCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, adminId, dto);
  }

  @Delete(':id')
  @Permissions('admin.categories.manage')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.categoriesService.deleteCategory(id, adminId);
  }
}
