import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class PurchaseBoostDto {
  @ApiProperty({ description: 'The Boost Package ID to purchase', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' })
  @IsUUID()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ description: 'Payment provider', example: 'STRIPE' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiPropertyOptional({ description: 'Promo coupon code', example: 'BOOSTFREE' })
  @IsString()
  @IsOptional()
  couponCode?: string;
}
