import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category', example: 'Cars' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Description of the category', example: 'All types of cars and vehicles' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category UUID if nesting', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Sorting order of the category', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Icon name/identifier or URL', example: 'directions_car' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon?: string;

  @ApiPropertyOptional({ description: 'Banner image URL', example: 'https://images.loopo.com/banners/cars.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bannerImage?: string;

  @ApiPropertyOptional({ description: 'Meta SEO title', example: 'Buy & Sell Cars - Loopo Marketplace' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'Meta SEO description', example: 'Find the best deals on new and used cars in your area on Loopo.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoDescription?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'The name of the category', example: 'SUV Cars' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the category', example: 'Sports Utility Vehicles' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category UUID if nesting', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Sorting order of the category', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Icon name/identifier or URL', example: 'directions_car' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon?: string;

  @ApiPropertyOptional({ description: 'Banner image URL', example: 'https://images.loopo.com/banners/suv.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bannerImage?: string;

  @ApiPropertyOptional({ description: 'Meta SEO title', example: 'Buy & Sell SUV Cars - Loopo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'Meta SEO description', example: 'Browse SUVs for sale on Loopo.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoDescription?: string;
}

export class MoveCategoryDto {
  @ApiPropertyOptional({ description: 'New parent category UUID (null to move to top level)', example: 'a5cbe71e-01fc-4043-9828-98f5a653ccfe' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CategoryReorderItemDto {
  @ApiProperty({ description: 'Category UUID to update', example: 'b1a201c1-4043-4e4c-bd48-b4ea07519ff0' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'New sort order value', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderCategoriesDto {
  @ApiProperty({ description: 'Array of categories and their sort orders', type: [CategoryReorderItemDto] })
  @IsNotEmpty()
  @Type(() => CategoryReorderItemDto)
  @ValidateNested({ each: true })
  categories: CategoryReorderItemDto[];
}

export class UpdateCategoryStatusDto {
  @ApiProperty({ description: 'Active status value', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
