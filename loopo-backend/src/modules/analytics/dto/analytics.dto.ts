import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum AnalyticsTimeframe {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  ALL = 'ALL',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: AnalyticsTimeframe, default: AnalyticsTimeframe.WEEK })
  @IsEnum(AnalyticsTimeframe)
  @IsOptional()
  timeframe?: AnalyticsTimeframe = AnalyticsTimeframe.WEEK;

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

export class ProductAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiProperty()
  @IsUUID()
  productId: string;
}

export class DashboardSummaryDto {
  @ApiProperty()
  totalListings: number;

  @ApiProperty()
  activeListings: number;

  @ApiProperty()
  pendingListings: number;

  @ApiProperty()
  soldListings: number;

  @ApiProperty()
  expiredListings: number;

  @ApiProperty()
  featuredListings: number;

  @ApiProperty()
  boostedListings: number;

  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  todayViews: number;

  @ApiProperty()
  weeklyViews: number;

  @ApiProperty()
  monthlyViews: number;

  @ApiProperty()
  favoriteCount: number;

  @ApiProperty()
  chatRequests: number;

  @ApiProperty()
  unreadChats: number;

  @ApiProperty()
  averageResponseTime: number; // in seconds

  @ApiProperty()
  sellerRating: number;

  @ApiProperty()
  trustScore: number;

  @ApiProperty()
  subscriptionPlan: string;

  @ApiProperty()
  remainingBoostCredits: number;

  @ApiProperty()
  remainingFeaturedCredits: number;
}
