import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminCreateRoleDto {
  @ApiProperty({ description: 'Unique role name', example: 'SUPPORT_AGENT' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Human-readable description of this role' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: 'Names of permissions to grant this role', type: [String], example: ['users.view', 'reports.view'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionNames?: string[];
}

export class AdminUpdateRoleDto {
  @ApiPropertyOptional({ description: 'Unique role name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Human-readable description of this role' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: 'Full replacement set of permission names for this role', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionNames?: string[];
}
