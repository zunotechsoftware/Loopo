import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { AttributeType } from '@prisma/client';

export class CreateAttributeDto {
  @ApiProperty({ description: 'The display name of the attribute', example: 'Brand' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Unique slug/key identifier for client use (e.g. brand). Auto-generated if omitted.', example: 'brand' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiProperty({ description: 'Data input type for validation and rendering', enum: AttributeType, example: 'SELECT' })
  @IsNotEmpty()
  @IsEnum(AttributeType)
  type: AttributeType;

  @ApiPropertyOptional({ description: 'Whether the listing must provide this attribute', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Minimum string length constraint', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minLength?: number;

  @ApiPropertyOptional({ description: 'Maximum string length constraint', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxLength?: number;

  @ApiPropertyOptional({ description: 'Minimum numeric value constraint', example: 1900 })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum numeric value constraint', example: 2027 })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Regular expression validator pattern', example: '^[A-Z]{3}-\\d{4}$' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regex?: string;

  @ApiPropertyOptional({ description: 'Whether value must be unique per category listing', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @ApiPropertyOptional({ description: 'Input field placeholder text', example: 'Select a brand' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Help instruction text for front-end users', example: 'Choose the manufacturer of this product' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  helpText?: string;

  @ApiPropertyOptional({ description: 'Default value if none is selected', example: 'Toyota' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Sort layout order of the field', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category Attribute Group UUID', example: 'e7c65345-0dcf-4e1b-9f6e-9bfca59ea321' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}

export class UpdateAttributeDto {
  @ApiPropertyOptional({ description: 'The display name of the attribute', example: 'Brand Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Unique slug/key identifier', example: 'brand_name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'Data input type', enum: AttributeType, example: 'SELECT' })
  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @ApiPropertyOptional({ description: 'Whether the listing must provide this attribute', example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Minimum string length constraint', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minLength?: number;

  @ApiPropertyOptional({ description: 'Maximum string length constraint', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxLength?: number;

  @ApiPropertyOptional({ description: 'Minimum numeric value constraint', example: 1000 })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum numeric value constraint', example: 1000000 })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Regular expression validator pattern', example: '.*' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regex?: string;

  @ApiPropertyOptional({ description: 'Whether value must be unique', example: false })
  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @ApiPropertyOptional({ description: 'Input field placeholder text', example: 'Enter value' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Help instruction text', example: 'Enter details' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  helpText?: string;

  @ApiPropertyOptional({ description: 'Default value if none is selected', example: '' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Sort layout order of the field', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category Attribute Group UUID', example: 'e7c65345-0dcf-4e1b-9f6e-9bfca59ea321' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateAttributeGroupDto {
  @ApiProperty({ description: 'Name of the attribute group', example: 'Specifications' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Layout order of the group', example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateAttributeGroupDto {
  @ApiPropertyOptional({ description: 'Name of the attribute group', example: 'Technical Specs' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Layout order of the group', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
