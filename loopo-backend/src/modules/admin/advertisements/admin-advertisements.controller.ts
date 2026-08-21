import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminAdvertisementsService } from './admin-advertisements.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/advertisements.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { AdType, AdStatus } from '@prisma/client';

@ApiTags('Admin - Advertisements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('admin/advertisements')
export class AdminAdvertisementsController {
  constructor(private readonly advertisementsService: AdminAdvertisementsService) {}

  @Get()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Get all advertisements' })
  @ApiQuery({ name: 'type', enum: AdType, required: false })
  @ApiQuery({ name: 'status', enum: AdStatus, required: false })
  async getAdvertisements(
    @Query('type') type?: AdType,
    @Query('status') status?: AdStatus,
  ) {
    return this.advertisementsService.getAllAdvertisements(type, status);
  }

  @Get(':id')
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Get an advertisement by ID' })
  async getAdvertisementById(@Param('id') id: string) {
    return this.advertisementsService.getAdvertisementById(id);
  }

  @Post()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Create a new advertisement' })
  async createAdvertisement(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAdvertisementDto,
  ) {
    return this.advertisementsService.createAdvertisement(userId, dto);
  }

  @Put(':id')
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Update an advertisement' })
  async updateAdvertisement(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAdvertisementDto,
  ) {
    return this.advertisementsService.updateAdvertisement(id, userId, dto);
  }

  @Delete(':id')
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Delete an advertisement' })
  async deleteAdvertisement(@Param('id') id: string) {
    return this.advertisementsService.deleteAdvertisement(id);
  }
}
