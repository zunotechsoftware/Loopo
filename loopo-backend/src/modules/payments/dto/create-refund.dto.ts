import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateRefundDto {
  @ApiProperty({ description: 'Payment database UUID to refund', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ description: 'Amount to refund (supports partial)', example: 499.00 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Reason for refund', example: 'Customer cancelled transaction' })
  @IsString()
  @IsOptional()
  reason?: string;
}
