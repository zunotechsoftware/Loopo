import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean, IsUUID, ValidateNested, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewTypeDto {
  SELLER_REVIEW = 'SELLER_REVIEW',
  BUYER_REVIEW = 'BUYER_REVIEW',
  PRODUCT_REVIEW = 'PRODUCT_REVIEW',
  TRANSACTION_REVIEW = 'TRANSACTION_REVIEW',
}

export class RatingDto {
  @ApiProperty({ description: 'Overall rating 1-5', example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  overall: number;

  @ApiPropertyOptional({ description: 'Communication quality 1-5', example: 5 })
  @IsInt() @Min(1) @Max(5) @IsOptional()
  communication?: number;

  @ApiPropertyOptional({ description: 'Response time 1-5', example: 4 })
  @IsInt() @Min(1) @Max(5) @IsOptional()
  responseTime?: number;

  @ApiPropertyOptional({ description: 'Product accuracy 1-5', example: 5 })
  @IsInt() @Min(1) @Max(5) @IsOptional()
  productAccuracy?: number;

  @ApiPropertyOptional({ description: 'Delivery experience 1-5', example: 3 })
  @IsInt() @Min(1) @Max(5) @IsOptional()
  deliveryExperience?: number;

  @ApiPropertyOptional({ description: 'Behaviour 1-5', example: 5 })
  @IsInt() @Min(1) @Max(5) @IsOptional()
  behaviour?: number;

  @ApiPropertyOptional({ description: 'Value for money 1-5', example: 4 })
  @IsInt() @Min(1) @Max(5) @IsOptional()
  valueForMoney?: number;

  @ApiPropertyOptional({ description: 'Would recommend?', example: true })
  @IsBoolean() @IsOptional()
  wouldRecommend?: boolean;
}

export class ReviewPhotoInputDto {
  @ApiProperty({ description: 'Public URL of the already-uploaded photo (from POST /reviews/photos/upload-url)' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ description: 'S3 object key of the already-uploaded photo' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;
}

export class CreateReviewDto {
  @ApiProperty({ description: 'Review type', enum: ReviewTypeDto, example: 'PRODUCT_REVIEW' })
  @IsEnum(ReviewTypeDto)
  @IsNotEmpty()
  reviewType: ReviewTypeDto;

  // SELLER_REVIEW is eligibility-gated (see ReviewsService.createReview):
  // targetUserId/productId are derived from this eligibility record
  // server-side and NOT trusted from the client, closing the IDOR/
  // "manufactured eligibility" hole a plain client-supplied targetUserId
  // would otherwise open. Required when reviewType is SELLER_REVIEW;
  // ignored for other review types, which keep their pre-existing behaviour.
  @ApiPropertyOptional({ description: 'Rating-eligibility id (required for SELLER_REVIEW) - identifies the real completed transaction this review is about' })
  @IsUUID() @IsOptional()
  eligibilityId?: string;

  @ApiPropertyOptional({ description: 'Target user ID (for seller/buyer reviews, when not using eligibilityId)' })
  @IsUUID() @IsOptional()
  targetUserId?: string;

  @ApiPropertyOptional({ description: 'Product ID (for product/transaction reviews)' })
  @IsUUID() @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Payment ID to verify completed transaction' })
  @IsUUID() @IsOptional()
  paymentId?: string;

  @ApiPropertyOptional({ description: 'Review title', example: 'Great seller!' })
  @IsString() @IsOptional()
  title?: string;

  // Whitespace-only text ("   ") would pass @MaxLength fine, so the real
  // "not blank" check (trim, then check length) happens in
  // ReviewsService.createReview, not here.
  @ApiPropertyOptional({ description: 'Review content (optional, but if provided must be real text, not just whitespace)', example: 'Product was exactly as described. Fast response.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  content?: string;

  @ApiProperty({ description: 'Rating details', type: RatingDto })
  @ValidateNested()
  @Type(() => RatingDto)
  rating: RatingDto;

  @ApiPropertyOptional({ description: 'Predefined review tag IDs (validated against real, active ReviewTag rows)', type: [String] })
  @IsArray() @IsOptional() @ArrayMaxSize(10) @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Optional photos, already uploaded via POST /reviews/photos/upload-url (max 6)', type: [ReviewPhotoInputDto] })
  @IsArray() @IsOptional() @ArrayMaxSize(6) @ValidateNested({ each: true }) @Type(() => ReviewPhotoInputDto)
  photos?: ReviewPhotoInputDto[];
}
