import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCondition, ProductStatus } from '@prisma/client';

export class ProductLocationDto {
  @ApiProperty({ description: 'Country of the listing', example: 'India' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiProperty({ description: 'State/Region of the listing', example: 'Karnataka' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ description: 'City/Town name', example: 'Bengaluru' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: 'Local area or neighborhood', example: 'Indiranagar' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  area?: string;

  @ApiPropertyOptional({ description: 'Zip/Postal code', example: '560038' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Latitude for map coordinates', example: 12.9716 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for map coordinates', example: 77.5946 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class ProductAttributeDto {
  @ApiProperty({ description: 'Category dynamic attribute UUID', example: 'b3174ab1-8e2b-426b-9c7a-9dbca59ea500' })
  @IsNotEmpty()
  @IsUUID()
  attributeId: string;

  @ApiProperty({ description: 'User input value for this attribute', example: 'Petrol' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'The title of the product listing', example: '2020 Honda Civic Sedan VTi' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The detailed description of the product', example: 'Single owner, pristine condition, regularly serviced. Mileage 15,000 km.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: 'Main category UUID', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Subcategory UUID if nested', example: 'f3174ab1-8e2b-426b-9c7a-9dbca59ea243' })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiProperty({ description: 'Product condition status', enum: ProductCondition, example: 'LIKE_NEW' })
  @IsNotEmpty()
  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @ApiProperty({ description: 'Selling price of the product', example: 1850000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Three-letter currency code', example: 'INR', default: 'INR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Whether the price is negotiable', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiPropertyOptional({ description: 'Available listing quantity', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: 'Location details of the product' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProductLocationDto)
  location: ProductLocationDto;

  @ApiPropertyOptional({ description: 'List of dynamic attributes configured for this category', type: [ProductAttributeDto] })
  @IsOptional()
  @Type(() => ProductAttributeDto)
  @ValidateNested({ each: true })
  attributes?: ProductAttributeDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'The title of the product listing', example: '2020 Honda Civic VTi (Negotiable)' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'The detailed description of the product', example: 'Excellent mileage. Price reduced.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Main category UUID', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Subcategory UUID if nested', example: 'f3174ab1-8e2b-426b-9c7a-9dbca59ea243' })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Product condition status', enum: ProductCondition, example: 'GOOD' })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiPropertyOptional({ description: 'Selling price of the product', example: 1800000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Three-letter currency code', example: 'INR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Whether the price is negotiable', example: false })
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiPropertyOptional({ description: 'Available listing quantity', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Location details of the product' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductLocationDto)
  location?: ProductLocationDto;

  @ApiPropertyOptional({ description: 'List of dynamic attributes configured for this category', type: [ProductAttributeDto] })
  @IsOptional()
  @Type(() => ProductAttributeDto)
  @ValidateNested({ each: true })
  attributes?: ProductAttributeDto[];
}

export class ListingSearchQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search term/keyword', example: 'Honda Civic' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Filter by category UUID', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by subcategory UUID', example: 'f3174ab1-8e2b-426b-9c7a-9dbca59ea243' })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by condition', enum: ProductCondition })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiPropertyOptional({ description: 'Minimum price limit', example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price limit', example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by city', example: 'Bengaluru' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate for proximity search', example: 12.9716 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate for proximity search', example: 77.5946 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Search radius distance in Kilometers', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radiusKm?: number = 10;

  @ApiPropertyOptional({ description: 'Sort criteria', example: 'createdAt', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort direction', example: 'desc', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter by status (Admin / Owner usage only)', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

export class RejectProductDto {
  @ApiProperty({ description: 'The reason why the listing is being rejected', example: 'Inappropriate description or duplicate listing' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  reason: string;
}

export class FeatureProductDto {
  @ApiProperty({ description: 'Number of days the product should remain featured', example: 7, default: 7 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationDays: number;
}

export class BoostProductDto {
  @ApiProperty({ description: 'Name of the boost package', example: 'GOLD_BOOST_WEEKLY' })
  @IsNotEmpty()
  @IsString()
  packageName: string;
}
