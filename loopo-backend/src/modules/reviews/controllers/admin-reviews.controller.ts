import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Reviews')
@Controller('admin/reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Get all reviews (admin view)' })
  @ApiResponse({ status: 200, description: 'List of all reviews' })
  @Get()
  async getAllReviews() {
    return this.reviewsService.adminGetAllReviews();
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
