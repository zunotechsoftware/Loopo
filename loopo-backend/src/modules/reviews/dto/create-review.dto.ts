import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, Max, IsBoolean, IsUUID, ValidateNested } from 'class-validator';
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

export class CreateReviewDto {
  @ApiProperty({ description: 'Review type', enum: ReviewTypeDto, example: 'PRODUCT_REVIEW' })
  @IsEnum(ReviewTypeDto)
  @IsNotEmpty()
  reviewType: ReviewTypeDto;

  @ApiPropertyOptional({ description: 'Target user ID (for seller/buyer reviews)' })
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

  @ApiProperty({ description: 'Review content', example: 'Product was exactly as described. Fast response.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Rating details', type: RatingDto })
  @ValidateNested()
  @Type(() => RatingDto)
  rating: RatingDto;
}
