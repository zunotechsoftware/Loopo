import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ReportTargetTypeDto } from './create-report.dto';

export enum ReportStatusDto {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum PriorityLevelDto {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class ReportQueryDto {
  @ApiPropertyOptional({ description: 'Filter reports by status', enum: ReportStatusDto })
  @IsEnum(ReportStatusDto)
  @IsOptional()
  status?: ReportStatusDto;

  @ApiPropertyOptional({ description: 'Filter reports by reported target type', enum: ReportTargetTypeDto })
  @IsEnum(ReportTargetTypeDto)
  @IsOptional()
  targetType?: ReportTargetTypeDto;

  @ApiPropertyOptional({ description: 'Filter reports by severity level', enum: PriorityLevelDto })
  @IsEnum(PriorityLevelDto)
  @IsOptional()
  priority?: PriorityLevelDto;

  @ApiPropertyOptional({ description: 'Filter cases by assigned moderator ID', example: 'd3b07384-d113-4956-a5cc-810237e19003' })
  @IsString()
  @IsOptional()
  assignedModeratorId?: string;
}
