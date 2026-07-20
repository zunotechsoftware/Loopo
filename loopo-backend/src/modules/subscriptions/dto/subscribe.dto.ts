import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ description: 'The Subscription Plan ID to purchase', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ description: 'Payment provider integration code', example: 'STRIPE' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiPropertyOptional({ description: 'Promo coupon code', example: 'NEWPLAN20' })
  @IsString()
  @IsOptional()
  couponCode?: string;
}
