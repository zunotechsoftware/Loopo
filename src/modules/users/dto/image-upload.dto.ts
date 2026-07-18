import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class GetUploadUrlDto {
  @ApiProperty({ description: 'The exact name of the file to upload', example: 'avatar.png' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'The standard MIME type of the file', example: 'image/png' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^image\/(jpeg|png|webp)$/, { message: 'Only JPEG, PNG, and WEBP image formats are supported.' })
  fileType: string;

  @ApiProperty({ description: 'Size of the file in bytes', example: 2048000 })
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}

export class ConfirmUploadDto {
  @ApiProperty({ description: 'The UUID of the created MediaFile record to confirm', example: 'c7c8b093-a442-4fcf-bc01-da7963d8ff1a' })
  @IsNotEmpty()
  @IsString()
  mediaId: string;
}
