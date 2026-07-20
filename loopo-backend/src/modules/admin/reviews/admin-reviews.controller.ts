import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminReviewsService } from './admin-reviews.service';
import { UpdateReviewVisibilityDto } from './dto/admin-review.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { ReviewType } from '@prisma/client';

@ApiTags('Admin - Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/admin/reviews')
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReviewType })
  async getReviews(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: ReviewType,
  ) {
    return this.adminReviewsService.getAllReviews(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      type,
    );
  }

  @Get(':id')
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Get review by id' })
  async getReviewById(@Param('id') id: string) {
    return this.adminReviewsService.getReviewById(id);
  }

  @Patch(':id/hide')
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Update review visibility' })
  async updateVisibility(
    @Param('id') id: string,
    @Body() dto: UpdateReviewVisibilityDto,
  ) {
    return this.adminReviewsService.updateReviewVisibility(id, dto);
  }

  @Delete(':id')
  @Permissions('admin.reports.manage')
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(@Param('id') id: string) {
    return this.adminReviewsService.deleteReview(id);
  }
}
