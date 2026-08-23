import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition } from '@prisma/client';

export class RejectProductDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class FeatureProductDto {
  @ApiProperty({ description: 'Number of days to feature' })
  @IsInt()
  @Min(1)
  durationDays: number;
}

export class BoostProductDto {
  @ApiProperty({ description: 'Package name for boost' })
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @ApiProperty({ description: 'Number of days to boost' })
  @IsInt()
  @Min(1)
  durationDays: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: ProductCondition })
  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;
}
