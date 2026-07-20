import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DeleteMessageDto {
  @ApiProperty({ description: 'The Message ID in chat to delete', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15' })
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiPropertyOptional({ description: 'Related investigation case ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiProperty({ description: 'Reason for deleting the chat message', example: 'Harassment and abusive language.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
