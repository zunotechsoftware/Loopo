import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCmsService } from './admin-cms.service';
import { CreateCmsPageDto, UpdateCmsPageDto } from './dto/cms-page.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';

@ApiTags('Admin - CMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/pages')
export class AdminCmsController {
  constructor(private readonly cmsService: AdminCmsService) {}

  @Get()
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Get all CMS pages' })
  async getPages() {
    return this.cmsService.getAllPages();
  }

  @Post()
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Create a new CMS page' })
  async createPage(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCmsPageDto,
  ) {
    return this.cmsService.createPage(userId, dto);
  }

  @Put(':id')
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Update a CMS page' })
  async updatePage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCmsPageDto,
  ) {
    return this.cmsService.updatePage(id, userId, dto);
  }

  @Delete(':id')
  @Permissions('admin.settings.manage')
  @ApiOperation({ summary: 'Delete a CMS page' })
  async deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }
}
