import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ description: 'Coupon code', example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Purchase amount before discount', example: 1500.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
