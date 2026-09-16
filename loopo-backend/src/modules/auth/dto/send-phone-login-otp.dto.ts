import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendPhoneLoginOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number to send a login OTP to' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'Enter a valid phone number' })
  phone!: string;
}
