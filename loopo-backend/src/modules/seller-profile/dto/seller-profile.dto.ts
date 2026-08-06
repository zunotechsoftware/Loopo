import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSellerProfileDto {
  @ApiPropertyOptional({ description: 'Display name visible to other users', example: 'John Store' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Optional official store name', example: 'Doe Electronics store' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeName?: string;

  @ApiPropertyOptional({ description: 'A short bio of the seller store', example: 'Authorized reseller of premium electronic items.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Profile image URL for the seller store', example: 'https://example.com/images/johnstore.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
