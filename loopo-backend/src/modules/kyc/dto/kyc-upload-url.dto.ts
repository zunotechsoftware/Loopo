import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export type KycUploadSlot = 'FRONT' | 'BACK' | 'SELFIE';

export class KycUploadUrlDto {
  @ApiProperty({
    enum: ['FRONT', 'BACK', 'SELFIE'],
    description: 'Which KYC document image this upload is for',
    example: 'FRONT',
  })
  @IsNotEmpty()
  @IsIn(['FRONT', 'BACK', 'SELFIE'])
  slot: KycUploadSlot;

  @ApiProperty({ description: 'The exact name of the file to upload', example: 'aadhaar-front.jpg' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'The standard MIME type of the file', example: 'image/jpeg' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^image\/(jpeg|png|webp)$/, { message: 'Only JPEG, PNG, and WEBP image formats are supported.' })
  fileType: string;

  @ApiProperty({ description: 'Size of the file in bytes', example: 2048000 })
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}
