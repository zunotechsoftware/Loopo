import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, TicketStatus, TicketChannel } from '@prisma/client';

export class FilterTicketsDto {
  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: TicketChannel })
  @IsOptional()
  @IsEnum(TicketChannel)
  channel?: TicketChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional()
  @IsOptional()
  take?: number;
}

export class ReplyTicketDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  attachments?: Array<{ name: string; url: string; size: string }>;
}

export class AddNoteDto {
  @ApiProperty()
  @IsString()
  note: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class UpdateTicketPriorityDto {
  @ApiProperty({ enum: TicketPriority })
  @IsEnum(TicketPriority)
  priority: TicketPriority;
}

export class AssignAgentDto {
  @ApiProperty()
  @IsString()
  agentName: string;
}

export class EscalateTicketDto {
  @ApiProperty()
  @IsString()
  department: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
