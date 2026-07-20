import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export class BroadcastNotificationDto {
  @ApiProperty({ description: 'Title of the notification' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Body/Message of the notification' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Target user role (e.g., CUSTOMER, SELLER, ALL)', default: 'ALL' })
  @IsString()
  @IsOptional()
  targetRole?: string;

  @ApiPropertyOptional({ description: 'Specific user IDs to target (overrides targetRole)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @ApiPropertyOptional({ description: 'Schedule the notification for later' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
