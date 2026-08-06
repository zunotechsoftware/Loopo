import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCondition } from '@prisma/client';

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Search term/keyword', example: 'iPhone 15' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Filter by Category UUID', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by Subcategory UUID', example: 'f3174ab1-8e2b-426b-9c7a-9dbca59ea243' })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by condition', enum: ProductCondition })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiPropertyOptional({ description: 'Minimum price limit', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price limit', example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'City name', example: 'Mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Latitude for nearby proximity search', example: 19.076 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for nearby proximity search', example: 72.877 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Radius range in kilometers', example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radiusKm?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by specific seller UUID', example: 'd3b07384-d113-49cd-a5d6-89b071e6212d' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({ description: 'Filter by only featured ads', example: true })
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Filter by only boosted ads', example: true })
  @IsOptional()
  @Type(() => Boolean)
  isBoosted?: boolean;

  @ApiPropertyOptional({ description: 'Limit search postings by date range', enum: ['24h', '7d', '30d', 'all'], example: '7d' })
  @IsOptional()
  @IsString()
  datePosted?: '24h' | '7d' | '30d' | 'all' = 'all';

  @ApiPropertyOptional({ description: 'Page number for offset pagination', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort layout criteria', example: 'createdAt', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort layout order direction', example: 'desc', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter attributes in JSON format: [{"attributeId":"uuid","value":"val"}]' })
  @IsOptional()
  @IsString()
  attributes?: string;
}

export class AutocompleteQueryDto {
  @ApiProperty({ description: 'Search input text', example: 'iph' })
  @IsNotEmpty()
  @IsString()
  query: string;
}
