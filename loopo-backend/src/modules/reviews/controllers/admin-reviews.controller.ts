import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { LogAudit } from '../../../shared/common/decorators/audit-log.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewType } from '@prisma/client';

@ApiTags('Admin Reviews')
@Controller('admin/reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Get all reviews (admin view) - searchable/filterable' })
  @ApiResponse({ status: 200, description: 'List of all reviews' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReviewType })
  @ApiQuery({ name: 'isVisible', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'reportedOnly', required: false, type: Boolean })
  @Get()
  async getAllReviews(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: ReviewType,
    @Query('isVisible') isVisible?: string,
    @Query('search') search?: string,
    @Query('reportedOnly') reportedOnly?: string,
  ) {
    return this.reviewsService.adminGetAllReviews({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      reviewType: type,
      isVisible: isVisible !== undefined ? isVisible === 'true' : undefined,
      search,
      reportedOnly: reportedOnly === 'true',
    });
  }

  @Permissions('reviews.moderate')
  @ApiOperation({ summary: 'Get a single review by id, including reports filed against it (admin view)' })
  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    return this.reviewsService.adminGetReviewById(id);
  }

  @Permissions('reviews.moderate')
  @LogAudit('REVIEW_HIDE', 'Review')
  @ApiOperation({ summary: 'Hide a review from public view' })
  @Patch(':id/hide')
  async hideReview(@Param('id') id: string) {
    return this.reviewsService.adminHideReview(id);
  }

  @Permissions('reviews.moderate')
  @LogAudit('REVIEW_RESTORE', 'Review')
  @ApiOperation({ summary: 'Restore a hidden review' })
  @Patch(':id/restore')
  async restoreReview(@Param('id') id: string) {
    return this.reviewsService.adminRestoreReview(id);
  }

  @Permissions('reviews.moderate')
  @LogAudit('REVIEW_DELETE', 'Review')
  @ApiOperation({ summary: 'Soft delete a review (admin)' })
  @Patch(':id/delete')
  async deleteReview(@Param('id') id: string) {
    return this.reviewsService.adminDeleteReview(id);
  }
}
