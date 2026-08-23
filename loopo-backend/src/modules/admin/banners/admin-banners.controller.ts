import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminBannersService } from './admin-banners.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { BannerType } from '@prisma/client';

@ApiTags('Admin - Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private readonly bannersService: AdminBannersService) {}

  @Get()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Get all banners' })
  @ApiQuery({ name: 'type', enum: BannerType, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  async getBanners(
    @Query('type') type?: BannerType,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.bannersService.getAllBanners(type, isActive);
  }

  @Get(':id')
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Get a banner by ID' })
  async getBannerById(@Param('id') id: string) {
    return this.bannersService.getBannerById(id);
  }

  @Post()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Create a new banner' })
  async createBanner(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBannerDto,
  ) {
    return this.bannersService.createBanner(userId, dto);
  }

  @Put(':id')
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Update a banner' })
  async updateBanner(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.bannersService.updateBanner(id, userId, dto);
  }

  @Delete(':id')
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Delete a banner' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }
}
