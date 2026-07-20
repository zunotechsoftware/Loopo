import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class PurchaseFeaturedDto {
  @ApiProperty({ description: 'The Product/Listing ID to highlight', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'The Featured Package ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' })
  @IsUUID()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ description: 'Payment provider', example: 'STRIPE' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiPropertyOptional({ description: 'Promo coupon code', example: 'PROMO10' })
  @IsString()
  @IsOptional()
  couponCode?: string;
}
