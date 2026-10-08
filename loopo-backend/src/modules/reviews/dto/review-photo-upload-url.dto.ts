import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewPhotoUploadUrlDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  fileType: string;
}
