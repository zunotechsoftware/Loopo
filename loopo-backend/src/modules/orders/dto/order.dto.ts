import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'The unique ID of the product being purchased' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Quantity of items to purchase', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'The target order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
