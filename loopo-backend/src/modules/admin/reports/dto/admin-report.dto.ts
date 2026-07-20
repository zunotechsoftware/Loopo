import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, PriorityLevel, ModerationActionType } from '@prisma/client';

export class ResolveReportDto {
  @ApiProperty({ description: 'Resolution notes' })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiPropertyOptional({ enum: ModerationActionType })
  @IsEnum(ModerationActionType)
  @IsOptional()
  actionType?: ModerationActionType;
}

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({ description: 'Notes regarding status change' })
  @IsString()
  @IsOptional()
  note?: string;
}
