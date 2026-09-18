import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition } from '@prisma/client';

// Named Admin*/*Product to disambiguate from products/dto/product.dto.ts's
// UpdateProductDto (a different, real, reachable DTO for the seller-facing
// PUT /products/:id) - both used to share the plain name "UpdateProductDto",
// which is a valid class in two different modules but produces a duplicate
// Swagger schema warning (and would be a real conflict once @nestjs/swagger
// enforces unique names, per its own deprecation notice).
export class AdminUpdateProductDto {
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
