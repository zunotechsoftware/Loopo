import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSystemSettingDto {
  @ApiProperty({ description: 'The unique key for the setting' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'The value for the setting (can be JSON)' })
  @IsObject()
  @IsNotEmpty()
  value: Record<string, any>;

  @ApiPropertyOptional({ description: 'The group this setting belongs to', default: 'GENERAL' })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiPropertyOptional({ description: 'Whether this setting is public to clients' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Description of the setting' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ type: [UpdateSystemSettingDto], description: 'Array of settings to update' })
  @ValidateNested({ each: true })
  @Type(() => UpdateSystemSettingDto)
  settings: UpdateSystemSettingDto[];
}
