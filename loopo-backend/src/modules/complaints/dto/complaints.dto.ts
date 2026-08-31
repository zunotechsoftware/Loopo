import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplaintStatus, ComplaintPriority, ComplaintSeverity, ComplaintChannel, ComplaintMessageType } from '@prisma/client';

export class FilterComplaintsDto {
  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({ enum: ComplaintPriority })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiPropertyOptional({ enum: ComplaintSeverity })
  @IsOptional()
  @IsEnum(ComplaintSeverity)
  severity?: ComplaintSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ComplaintChannel })
  @IsOptional()
  @IsEnum(ComplaintChannel)
  channel?: ComplaintChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

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
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional()
  @IsOptional()
  take?: number;
}

export class CreateComplaintDto {
  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  userEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedOrderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedAmount?: string;

  @ApiProperty()
  @IsString()
  subjectTitle: string;

  @ApiProperty()
  @IsString()
  subjectDescription: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ enum: ComplaintPriority })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiPropertyOptional({ enum: ComplaintSeverity })
  @IsOptional()
  @IsEnum(ComplaintSeverity)
  severity?: ComplaintSeverity;

  @ApiPropertyOptional({ enum: ComplaintChannel })
  @IsOptional()
  @IsEnum(ComplaintChannel)
  channel?: ComplaintChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedDepartment?: string;

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  evidenceFiles?: Array<{ name: string; url: string; size: string }>;
}

export class AddComplaintMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: ComplaintMessageType })
  @IsOptional()
  @IsEnum(ComplaintMessageType)
  senderType?: ComplaintMessageType; // CUSTOMER, VENDOR, INTERNAL

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  attachments?: Array<{ name: string; url: string; size: string }>;
}

export class AddInvestigationNoteDto {
  @ApiProperty()
  @IsString()
  findings: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateComplaintStatusDto {
  @ApiProperty({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;
}

export class AssignComplaintDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentName?: string;
}

export class ResolveComplaintDto {
  @ApiProperty()
  @IsString()
  resolutionType: string; // REFUND, CREDIT, VENDOR_PENALTY, REPLACEMENT, REJECTION, EXPLANATION

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiProperty()
  @IsString()
  summary: string;
}

export class EscalateComplaintDto {
  @ApiProperty()
  @IsString()
  department: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
