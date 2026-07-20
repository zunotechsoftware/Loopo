import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class BanUserDto {
  @ApiProperty({ description: 'The User ID to ban permanently', example: 'd3b07384-d113-4956-a5cc-810237e19004' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Related investigation case ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiProperty({ description: 'Reason for the permanent ban', example: 'Severe fraud/scam report confirmed.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
