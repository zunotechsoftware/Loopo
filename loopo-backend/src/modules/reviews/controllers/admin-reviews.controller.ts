import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewType } from '@prisma/client';

@ApiTags('Admin Reviews')
@Controller('admin/reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Get all reviews (admin view)' })
  @ApiResponse({ status: 200, description: 'List of all reviews' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReviewType })
  @Get()
  async getAllReviews(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: ReviewType,
  ) {
    return this.reviewsService.adminGetAllReviews(
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
      type,
    );
  }

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Get a single review by id (admin view)' })
  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    return this.reviewsService.adminGetReviewById(id);
  }

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Hide a review from public view' })
  @Patch(':id/hide')
  async hideReview(@Param('id') id: string) {
    return this.reviewsService.adminHideReview(id);
  }

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Restore a hidden review' })
  @Patch(':id/restore')
  async restoreReview(@Param('id') id: string) {
    return this.reviewsService.adminRestoreReview(id);
  }

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Soft delete a review (admin)' })
  @Patch(':id/delete')
  async deleteReview(@Param('id') id: string) {
    return this.reviewsService.adminDeleteReview(id);
  }
}
