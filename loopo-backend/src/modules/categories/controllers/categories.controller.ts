import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  MoveCategoryDto,
  ReorderCategoriesDto,
  UpdateCategoryStatusDto,
} from '../dto/category.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Roles } from '../../../shared/common/decorators/roles.decorator';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get root categories' })
  @ApiResponse({ status: 200, description: 'List of top-level categories.' })
  async findParents() {
    const categories = await this.categoriesService.getParentCategories();
    return { message: 'Root categories retrieved successfully', data: categories };
  }

  @Get('tree')
  @Public()
  @ApiOperation({ summary: 'Get category tree' })
  @ApiResponse({ status: 200, description: 'Nested category tree.' })
  async getTree() {
    const tree = await this.categoriesService.getCategoryTree();
    return { message: 'Category tree retrieved successfully', data: tree };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Category details.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.getCategoryDetails(id);
    return { message: 'Category details retrieved successfully', data: category };
  }

  @Get(':id/path')
  @Public()
  @ApiOperation({ summary: 'Get category path' })
  @ApiResponse({ status: 200, description: 'Flat category ancestry list (root to node).' })
  async getPath(@Param('id') id: string) {
    const path = await this.categoriesService.getCategoryPath(id);
    return { message: 'Category path retrieved successfully', data: path };
  }

  @Get(':id/breadcrumb')
  @Public()
  @ApiOperation({ summary: 'Get category breadcrumbs' })
  @ApiResponse({ status: 200, description: 'Breadcrumbs list.' })
  async getBreadcrumbs(@Param('id') id: string) {
    const breadcrumbs = await this.categoriesService.getCategoryBreadcrumbs(id);
    return { message: 'Category breadcrumbs retrieved successfully', data: breadcrumbs };
  }

  @Get(':id/children')
  @Public()
  @ApiOperation({ summary: 'Get child categories' })
  @ApiResponse({ status: 200, description: 'Immediate children of category.' })
  async getChildren(@Param('id') id: string) {
    const children = await this.categoriesService.getChildCategories(id);
    return { message: 'Child categories retrieved successfully', data: children };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.create', 'categories.manage')
  @LogAudit('CREATE_CATEGORY', 'Category')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    const category = await this.categoriesService.createCategory(createCategoryDto, req.user.id);
    return { message: 'Category created successfully', data: category };
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.update', 'categories.manage')
  @LogAudit('UPDATE_CATEGORY', 'Category')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    const category = await this.categoriesService.updateCategory(id, updateCategoryDto, req.user.id);
    return { message: 'Category updated successfully', data: category };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.delete', 'categories.manage')
  @LogAudit('DELETE_CATEGORY', 'Category')
  @ApiOperation({ summary: 'Delete a category (soft delete)' })
  @ApiResponse({ status: 200, description: 'Category soft deleted.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const result = await this.categoriesService.deleteCategory(id, req.user.id);
    return { message: 'Category deleted successfully', data: result };
  }

  @Patch(':id/restore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.update', 'categories.manage')
  @LogAudit('RESTORE_CATEGORY', 'Category')
  @ApiOperation({ summary: 'Restore a soft deleted category' })
  @ApiResponse({ status: 200, description: 'Category restored successfully.' })
  async restore(@Param('id') id: string, @Request() req: any) {
    const result = await this.categoriesService.restoreCategory(id, req.user.id);
    return { message: 'Category restored successfully', data: result };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.update', 'categories.manage')
  @LogAudit('UPDATE_CATEGORY_STATUS', 'Category')
  @ApiOperation({ summary: 'Enable or disable a category' })
  @ApiResponse({ status: 200, description: 'Category status updated.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCategoryStatusDto,
    @Request() req: any,
  ) {
    const category = await this.categoriesService.updateCategoryStatus(
      id,
      updateStatusDto.isActive,
      req.user.id,
    );
    return { message: 'Category status updated successfully', data: category };
  }

  @Post(':id/move')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.update', 'categories.manage')
  @LogAudit('MOVE_CATEGORY', 'Category')
  @ApiOperation({ summary: 'Move category to a new parent' })
  @ApiResponse({ status: 200, description: 'Category hierarchy moved successfully.' })
  async moveCategory(
    @Param('id') id: string,
    @Body() moveCategoryDto: MoveCategoryDto,
    @Request() req: any,
  ) {
    const category = await this.categoriesService.moveCategory(
      id,
      moveCategoryDto.parentId || null,
      req.user.id,
    );
    return { message: 'Category moved successfully', data: category };
  }

  @Post(':id/reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('categories.update', 'categories.manage')
  @LogAudit('REORDER_CATEGORIES', 'Category')
  @ApiOperation({ summary: 'Reorder categories sortOrder values' })
  @ApiResponse({ status: 200, description: 'Sort orders updated successfully.' })
  async reorderCategories(
    @Body() reorderDto: ReorderCategoriesDto,
    @Request() req: any,
  ) {
    const result = await this.categoriesService.reorderCategories(reorderDto, req.user.id);
    return { message: 'Categories reordered successfully', data: result };
  }
}
