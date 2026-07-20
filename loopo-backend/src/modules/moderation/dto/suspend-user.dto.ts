import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class SuspendUserDto {
  @ApiProperty({ description: 'The User ID to suspend', example: 'd3b07384-d113-4956-a5cc-810237e19004' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Duration of the suspension in days', example: 7 })
  @IsNumber()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional({ description: 'The related moderation case ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiProperty({ description: 'Reason description for user suspension', example: 'System detected multiple spam listings' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
