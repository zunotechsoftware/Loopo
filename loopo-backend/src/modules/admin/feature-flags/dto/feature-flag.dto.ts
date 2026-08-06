import { IsString, IsNotEmpty, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFeatureFlagDto {
  @ApiProperty({ description: 'The unique key of the feature flag' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({ description: 'The name of the feature flag' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the feature flag' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the feature is enabled' })
  @IsBoolean()
  isEnabled: boolean;
}

export class BulkUpdateFeatureFlagsDto {
  @ApiProperty({ type: [UpdateFeatureFlagDto], description: 'Array of feature flags to update' })
  @ValidateNested({ each: true })
  @Type(() => UpdateFeatureFlagDto)
  flags: UpdateFeatureFlagDto[];
}
