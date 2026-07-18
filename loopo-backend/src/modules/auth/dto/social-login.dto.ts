import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({ example: 'oauth_access_token_value', description: 'Social provider access token or ID token' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
