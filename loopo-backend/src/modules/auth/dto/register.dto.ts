import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name'
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: '+919876543210',
    description: 'User mobile number with country code (international format)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}\d{6,15}$/, {
    message: 'Phone number must be in international format (e.g., +919876543210)',
  })
  phone!: string;

  @ApiProperty({
    example: 'Secure@Pass123',
    description: 'User password (min 8 chars, at least one uppercase, lowercase, number, and special character)'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/, {
    message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password!: string;
}