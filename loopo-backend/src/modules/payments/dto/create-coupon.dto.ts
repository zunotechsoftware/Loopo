import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, Min, IsDateString } from 'class-validator';

export enum CouponTypeDto {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateCouponDto {
  @ApiProperty({ description: 'Unique coupon code', example: 'FESTIVE50' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Display name/description', example: '50% off on premium subscriptions' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Type of coupon discount', enum: CouponTypeDto, example: 'PERCENTAGE' })
  @IsEnum(CouponTypeDto)
  @IsNotEmpty()
  type: CouponTypeDto;

  @ApiProperty({ description: 'Discount value (Percentage or Fixed amount)', example: 50.00 })
  @IsNumber()
  @Min(0.01)
  value: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount required', example: 100.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Maximum discount cap (only for percentage coupons)', example: 500.00 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Maximum total redemptions allowed across marketplace', example: 100 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Usage limit per user', example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'Coupon expiry date', example: '2026-12-31T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
