import { IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateOfferDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}
