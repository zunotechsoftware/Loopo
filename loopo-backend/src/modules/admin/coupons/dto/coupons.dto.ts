import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ description: 'Coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Coupon name/description' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  @IsNotEmpty()
  type: CouponType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount required' })
  @IsNumber()
  @IsOptional()
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount for percentage coupons' })
  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Total number of times this coupon can be used' })
  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Number of times a single user can use this coupon' })
  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Is coupon active?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCouponDto extends CreateCouponDto {}
