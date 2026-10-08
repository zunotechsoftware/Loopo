import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { RespondReviewDto } from '../dto/respond-review.dto';
import { ReportReviewDto } from '../dto/report-review.dto';
import { ReviewPhotoUploadUrlDto } from '../dto/review-photo-upload-url.dto';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/common/decorators/current-user.decorator';
import { Public } from '../../../shared/common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Permissions('reviews.create')
  @ApiOperation({ summary: 'Submit a new review (seller reviews require a valid eligibilityId)' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @Post('reviews')
  async createReview(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(user.id, dto);
  }

  // --- Review tags catalog ---
  @Public()
  @ApiOperation({ summary: 'List active, predefined review tags' })
  @Get('reviews/tags')
  async getReviewTags() {
    return this.reviewsService.getReviewTags();
  }

  // --- Review photo uploads ---
  @Permissions('reviews.create')
  @ApiOperation({ summary: 'Get a presigned upload URL for a review photo' })
  @Post('reviews/photos/upload-url')
  async getPhotoUploadUrl(@CurrentUser() user: any, @Body() dto: ReviewPhotoUploadUrlDto) {
    return this.reviewsService.generatePhotoUploadUrl(user.id, dto.fileName, dto.fileType);
  }

  // --- Pending ratings (buyer-facing) ---
  @Permissions('reviews.view')
  @ApiOperation({ summary: "List the current user's pending (not-yet-submitted) rating invitations" })
  @Get('ratings/pending')
  async getMyPendingRatings(@CurrentUser() user: any) {
    return this.reviewsService.getMyPendingRatings(user.id);
  }

  @Permissions('reviews.view')
  @ApiOperation({ summary: 'Get a single pending rating invitation by id' })
  @Get('ratings/pending/:id')
  async getPendingRatingById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reviewsService.getPendingRatingById(user.id, id);
  }

  @Public()
  @ApiOperation({ summary: 'Get review by ID' })
  @Get('reviews/:id')
  async getReview(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  @Permissions('reviews.update')
  @ApiOperation({ summary: 'Update own review (within edit window)' })
  @Put('reviews/:id')
  async updateReview(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateReview(user.id, id, dto);
  }

  @Permissions('reviews.delete')
  @ApiOperation({ summary: 'Soft delete own review' })
  @Delete('reviews/:id')
  async deleteReview(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reviewsService.deleteReview(user.id, id);
  }

  // --- Dedicated seller Reviews page: server-side paginated + filterable ---
  @Public()
  @ApiOperation({ summary: 'Get paginated/filterable reviews received by a user (seller)' })
  @Get('users/:id/reviews')
  async getUserReviews(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('star') star?: string,
    @Query('positiveOnly') positiveOnly?: string,
  ) {
    return this.reviewsService.getSellerReviews(id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      star: star ? parseInt(star, 10) : undefined,
      positiveOnly: positiveOnly === 'true',
    });
  }

  @Public()
  @ApiOperation({ summary: 'Get the 1-5 star rating distribution for a seller' })
  @Get('users/:id/reviews/distribution')
  async getRatingDistribution(@Param('id') id: string) {
    return this.reviewsService.getRatingDistribution(id);
  }

  @Public()
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @Get('products/:id/reviews')
  async getProductReviews(@Param('id') id: string) {
    return this.reviewsService.getProductReviews(id);
  }

  // --- Reactions ---
  @Permissions('reviews.view')
  @ApiOperation({ summary: 'Add a reaction to a review (HELPFUL, NOT_HELPFUL, LIKE)' })
  @Post('reviews/:id/reactions')
  async addReaction(@CurrentUser() user: any, @Param('id') id: string, @Body('type') type: string) {
    return this.reviewsService.addReaction(user.id, id, type);
  }

  @Permissions('reviews.view')
  @ApiOperation({ summary: 'Remove a reaction from a review' })
  @Delete('reviews/:id/reactions')
  async removeReaction(@CurrentUser() user: any, @Param('id') id: string, @Body('type') type: string) {
    return this.reviewsService.removeReaction(user.id, id, type);
  }

  // --- Report a review (reuses the real reporting/moderation pipeline) ---
  @Permissions('reviews.view')
  @ApiOperation({ summary: 'Report a review for moderation' })
  @Post('reviews/:id/report')
  async reportReview(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: ReportReviewDto) {
    return this.reviewsService.reportReview(user.id, id, dto);
  }

  // --- Seller responses to reviews ---
  @Permissions('reviews.create')
  @ApiOperation({ summary: 'Respond to a review as the reviewed seller' })
  @Post('reviews/:id/response')
  async respondToReview(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: RespondReviewDto) {
    return this.reviewsService.respondToReview(user.id, id, dto);
  }

  @Permissions('reviews.update')
  @ApiOperation({ summary: 'Edit an existing seller response to a review' })
  @Put('reviews/:id/response')
  async updateResponse(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: RespondReviewDto) {
    return this.reviewsService.updateResponse(user.id, id, dto);
  }
}
