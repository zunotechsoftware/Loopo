import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { AdType, AdStatus } from '@prisma/client';

export class CreateAdvertisementDto {
  @ApiProperty({ description: 'Title of the advertisement' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: AdType, default: AdType.BANNER })
  @IsEnum(AdType)
  @IsOptional()
  type?: AdType;

  @ApiProperty({ description: 'Placement of the ad' })
  @IsString()
  @IsNotEmpty()
  placement: string;

  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiPropertyOptional({ enum: AdStatus, default: AdStatus.ACTIVE })
  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus;

  @ApiPropertyOptional({ description: 'Image URL for the ad' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Target URL on click' })
  @IsString()
  @IsOptional()
  targetUrl?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpdateAdvertisementDto extends CreateAdvertisementDto {}
