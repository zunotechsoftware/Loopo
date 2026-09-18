import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsArray } from 'class-validator';
import { NotificationType, NotificationStatus } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsNotEmpty()
  audience: string;

  // Only used when `audience` is "Segmented Users" - the specific user ids
  // hand-picked in the composer. Ignored for every other audience, which
  // resolve to a real user set server-side instead (see
  // UserNotificationsService.resolveAudience).
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetUserIds?: string[];

  @IsDateString()
  @IsOptional()
  sentScheduled?: string;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsNumber()
  @IsOptional()
  deliveryRate?: number;

  @IsString()
  @IsOptional()
  iconBg?: string;

  @IsString()
  @IsOptional()
  iconColor?: string;

  @IsString()
  @IsOptional()
  iconName?: string;
}

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsOptional()
  audience?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetUserIds?: string[];

  @IsDateString()
  @IsOptional()
  sentScheduled?: string;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsNumber()
  @IsOptional()
  deliveryRate?: number;

  @IsString()
  @IsOptional()
  iconBg?: string;

  @IsString()
  @IsOptional()
  iconColor?: string;

  @IsString()
  @IsOptional()
  iconName?: string;
}
