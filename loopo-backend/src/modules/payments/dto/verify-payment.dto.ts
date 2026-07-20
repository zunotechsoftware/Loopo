import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Payment record ID in database', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiPropertyOptional({ description: 'Provider payment ID (e.g. stripe payment_intent_id, razorpay_payment_id)', example: 'pi_3MtwKsLkdIwHu7ix2yA6' })
  @IsString()
  @IsOptional()
  providerPaymentId?: string;

  @ApiPropertyOptional({ description: 'Provider order ID (e.g. razorpay_order_id, paypal_order_id)', example: 'order_Ek7f435ntredfd' })
  @IsString()
  @IsOptional()
  providerOrderId?: string;

  @ApiPropertyOptional({ description: 'Secure signature for verifying payment integrity (e.g. razorpay signature)', example: 'abcde12345...' })
  @IsString()
  @IsOptional()
  signature?: string;
}
