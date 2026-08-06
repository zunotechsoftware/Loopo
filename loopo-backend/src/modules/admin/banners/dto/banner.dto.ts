import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerType } from '@prisma/client';

export class CreateBannerDto {
  @ApiProperty({ description: 'Title of the banner' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: BannerType, default: BannerType.HOMEPAGE })
  @IsEnum(BannerType)
  @IsOptional()
  type?: BannerType;

  @ApiProperty({ description: 'Image URL for the banner' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Target URL on click' })
  @IsString()
  @IsOptional()
  targetUrl?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether the banner is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Target audience (ALL, LOGGED_IN, GUEST)' })
  @IsString()
  @IsOptional()
  audience?: string;
}

export class UpdateBannerDto extends CreateBannerDto {}
