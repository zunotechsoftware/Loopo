import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
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
  @ApiOperation({ summary: 'Submit a new review' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @Post('reviews')
  async createReview(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(user.id, dto);
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

  @Public()
  @ApiOperation({ summary: 'Get all reviews received by a user' })
  @Get('users/:id/reviews')
  async getUserReviews(@Param('id') id: string) {
    return this.reviewsService.getUserReviews(id);
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

  // --- Report a review ---
  @Permissions('reviews.view')
  @ApiOperation({ summary: 'Report a review for moderation' })
  @Post('reviews/:id/report')
  async reportReview(@CurrentUser() user: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.reviewsService.addReaction(user.id, id, 'REPORT');
  }
}
