import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycDocumentType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateKycDto {
  @ApiProperty({ description: 'The type of identification document', enum: KycDocumentType, example: KycDocumentType.NATIONAL_ID })
  @IsNotEmpty()
  @IsEnum(KycDocumentType)
  documentType: KycDocumentType;

  @ApiProperty({ description: 'The official document number', example: '123456789' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  documentNumber: string;

  @ApiProperty({ description: 'UUID of the media file representing the front image', example: 'f3a479e0-3fb1-4328-971c-43df899e31d4' })
  @IsNotEmpty()
  @IsString()
  frontImageId: string;

  @ApiPropertyOptional({ description: 'UUID of the media file representing the back image', example: 'e394b9f0-d3a1-43b8-871c-43df999e21d4' })
  @IsOptional()
  @IsString()
  backImageId?: string;

  @ApiProperty({ description: 'UUID of the media file representing the selfie image', example: 'a3d4f9e0-5fb1-4228-971c-43df899e31d5' })
  @IsNotEmpty()
  @IsString()
  selfieImageId: string;

  @ApiPropertyOptional({ description: 'Flag to submit the KYC application directly (otherwise saved as draft)', default: true })
  @IsOptional()
  @IsBoolean()
  submit?: boolean;
}

export class UpdateKycDto {
  @ApiPropertyOptional({ description: 'The type of identification document', enum: KycDocumentType, example: KycDocumentType.NATIONAL_ID })
  @IsOptional()
  @IsEnum(KycDocumentType)
  documentType?: KycDocumentType;

  @ApiPropertyOptional({ description: 'The official document number', example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'UUID of the media file representing the front image', example: 'f3a479e0-3fb1-4328-971c-43df899e31d4' })
  @IsOptional()
  @IsString()
  frontImageId?: string;

  @ApiPropertyOptional({ description: 'UUID of the media file representing the back image', example: 'e394b9f0-d3a1-43b8-871c-43df999e21d4' })
  @IsOptional()
  @IsString()
  backImageId?: string;

  @ApiPropertyOptional({ description: 'UUID of the media file representing the selfie image', example: 'a3d4f9e0-5fb1-4228-971c-43df899e31d5' })
  @IsOptional()
  @IsString()
  selfieImageId?: string;

  @ApiPropertyOptional({ description: 'Flag to submit the KYC application directly', default: true })
  @IsOptional()
  @IsBoolean()
  submit?: boolean;
}

export class RejectKycDto {
  @ApiProperty({ description: 'Administrative remarks explaining the rejection', example: 'Document image is too blurry' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  remarks: string;
}
