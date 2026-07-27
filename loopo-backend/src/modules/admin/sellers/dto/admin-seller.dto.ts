import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminSellerQueryDto {
  @ApiPropertyOptional({ description: 'Search term for seller name, store name, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by verification status', example: 'PENDING' })
  @IsOptional()
  @IsString()
  verificationStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by KYC status', example: 'APPROVED' })
  @IsOptional()
  @IsString()
  kycStatus?: string;

  @ApiPropertyOptional({ description: 'Skip counts for pagination', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({ description: 'Take counts for pagination', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 20;
}
