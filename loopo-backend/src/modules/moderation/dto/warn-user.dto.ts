import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class WarnUserDto {
  @ApiProperty({ description: 'The User ID to warn', example: 'd3b07384-d113-4956-a5cc-810237e19004' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'The related moderation case ID, if any', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiProperty({ description: 'Reason description for issuing this warning', example: 'Abusive message sent to buyer in chat.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
