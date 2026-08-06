import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectProductDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class FeatureProductDto {
  @ApiProperty({ description: 'Number of days to feature' })
  @IsInt()
  @Min(1)
  durationDays: number;
}

export class BoostProductDto {
  @ApiProperty({ description: 'Package name for boost' })
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @ApiProperty({ description: 'Number of days to boost' })
  @IsInt()
  @Min(1)
  durationDays: number;
}
