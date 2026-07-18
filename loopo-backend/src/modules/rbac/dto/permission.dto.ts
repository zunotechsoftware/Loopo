import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The unique name of the permission', example: 'products.delete' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'A short description of what this permission grants', example: 'Allows deleting any user listing' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: 'The unique name of the permission', example: 'products.delete' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'A short description of what this permission grants', example: 'Allows deleting user products' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
