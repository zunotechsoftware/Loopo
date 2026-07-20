import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateOptionDto {
  @ApiProperty({ description: 'The internal value of the option (stored in DB)', example: 'petrol' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  value: string;

  @ApiProperty({ description: 'The user-facing label of the option', example: 'Petrol' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  label: string;

  @ApiPropertyOptional({ description: 'Display order of the option in lists', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateOptionDto {
  @ApiPropertyOptional({ description: 'The internal value of the option', example: 'hybrid' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @ApiPropertyOptional({ description: 'The user-facing label of the option', example: 'Hybrid' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({ description: 'Display order of the option', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
