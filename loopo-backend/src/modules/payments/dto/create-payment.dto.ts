import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, Min, IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'The payment amount', example: 999.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'INR', default: 'INR' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'The payment provider', example: 'STRIPE' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiPropertyOptional({ description: 'Discount coupon code', example: 'WELCOME10' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Associated subscription plan ID (if purchasing subscription)', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsOptional()
  subscriptionPlanId?: string;

  @ApiPropertyOptional({ description: 'Associated featured package ID (if highlighting a listing)', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' })
  @IsUUID()
  @IsOptional()
  featuredPackageId?: string;

  @ApiPropertyOptional({ description: 'Associated boost package ID (if buying prioritised listing credits)', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' })
  @IsUUID()
  @IsOptional()
  boostPackageId?: string;

  @ApiPropertyOptional({ description: 'Associated Product/Listing ID (for featured placement)', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' })
  @IsUUID()
  @IsOptional()
  productId?: string;
}
