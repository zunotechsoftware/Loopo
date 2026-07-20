import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({ description: 'Name of the wishlist category', example: 'Dream Cars' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Set as the default target wishlist', example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateWishlistDto {
  @ApiPropertyOptional({ description: 'Updated name of the wishlist category', example: 'Luxury Wishlist' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Set as the default target wishlist', example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
