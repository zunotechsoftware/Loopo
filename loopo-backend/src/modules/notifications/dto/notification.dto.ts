import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
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
