import { IsUUID, IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsInt, IsNumber, IsUrl, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../enums/message-type.enum';

export class CreateAttachmentDto {
  @ApiProperty({ description: 'Original file URL in AWS S3', example: 'https://loopo-marketplace.s3.amazonaws.com/chat-attachments/img.png' })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({ description: 'Generated thumbnail URL', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Mime type of the file', example: 'image/png', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: 'Size of the file in bytes', example: 1048576, required: false })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiProperty({ description: 'Width of the image/video if applicable', example: 1080, required: false })
  @IsOptional()
  @IsInt()
  width?: number;

  @ApiProperty({ description: 'Height of the image/video if applicable', example: 1920, required: false })
  @IsOptional()
  @IsInt()
  height?: number;

  @ApiProperty({ description: 'Duration of audio/video file in seconds', example: 60.5, required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class SendMessageDto {
  @ApiProperty({ description: 'The conversation ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  conversationId: string;

  @ApiProperty({ description: 'Content of the message', example: 'Hello, is this product still available?' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Type of the message', enum: MessageType, example: MessageType.TEXT })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ description: 'Attachments if any', type: [CreateAttachmentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}

export class GetMessagesQueryDto {
  @ApiProperty({ description: 'Limit the number of messages returned', example: 50, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 50;

  @ApiProperty({ description: 'Offset for pagination', example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number = 0;
}

export class SearchMessagesQueryDto {
  @ApiProperty({ description: 'Keyword to search for in message content', example: 'negotiable' })
  @IsString()
  keyword: string;

  @ApiProperty({ description: 'Search inside a specific conversation', required: false })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({ description: 'Search for messages from a specific sender', required: false })
  @IsOptional()
  @IsUUID()
  senderId?: string;

  @ApiProperty({ description: 'Filter messages sent after this date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Filter messages sent before this date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetUploadUrlDto {
  @ApiProperty({ description: 'Name of the file to upload', example: 'photo.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'Content mime-type of the file', example: 'image/jpeg' })
  @IsString()
  fileType: string;
}
