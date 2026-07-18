import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Enable email notifications', default: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications', default: true })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications', default: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable marketing emails', default: false })
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @ApiPropertyOptional({ description: 'Enable chat message notifications', default: true })
  @IsOptional()
  @IsBoolean()
  chatNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable order alerts', default: true })
  @IsOptional()
  @IsBoolean()
  orderNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable listings activity updates', default: true })
  @IsOptional()
  @IsBoolean()
  listingNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable critical security alerts', default: true })
  @IsOptional()
  @IsBoolean()
  securityAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Subscribe to newsletter broadcasts', default: false })
  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;
}
