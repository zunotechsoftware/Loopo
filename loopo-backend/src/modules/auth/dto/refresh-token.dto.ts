import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token-jwt-string', description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
