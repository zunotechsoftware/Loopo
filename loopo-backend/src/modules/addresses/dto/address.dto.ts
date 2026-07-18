import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'Type of address', enum: AddressType, example: AddressType.HOME })
  @IsNotEmpty()
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty({ description: 'Full name of the recipient', example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ description: 'Recipient phone number', example: '+15550199' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  phone: string;

  @ApiProperty({ description: 'Address Line 1', example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Address Line 2', example: 'Apartment 4B' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty({ description: 'City', example: 'San Francisco' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'State/Province/Region', example: 'California' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ description: 'Country', example: 'United States' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiProperty({ description: 'Zip or Postal Code', example: '94105' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate', example: 37.7749 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate', example: -122.4194 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Whether this is the user\'s default address', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'Type of address', enum: AddressType, example: AddressType.WORK })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @ApiPropertyOptional({ description: 'Full name of the recipient', example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Recipient phone number', example: '+15550199' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Address Line 1', example: '456 Market St' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address Line 2', example: 'Suite 200' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City', example: 'San Francisco' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province/Region', example: 'California' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'United States' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Zip or Postal Code', example: '94105' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate', example: 37.7749 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate', example: -122.4194 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Whether this is the user\'s default address', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
