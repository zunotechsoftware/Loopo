import { IsUUID, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'The product listing ID to start the conversation for (optional for direct chats)', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'The user ID to start a direct conversation with (required if productId is not provided)', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  participantId?: string;
}

export class UpdateConversationSettingsDto {
  @ApiProperty({ description: 'Mute the conversation notifications', required: false })
  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;

  @ApiProperty({ description: 'Pin the conversation to top', required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({ description: 'Archive the conversation', required: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiProperty({ description: 'Time until which notifications are muted', required: false })
  @IsOptional()
  @IsDateString()
  mutedUntil?: string;
}
