import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class ReportReviewDto {
  @ApiProperty({ description: 'Reason code (from the real ReportReason catalog, e.g. FAKE_REVIEW, SPAM, HARASSMENT)', example: 'FAKE_REVIEW' })
  @IsString()
  @IsNotEmpty()
  reasonCode: string;

  @ApiPropertyOptional({ description: 'Custom reason (applicable if reasonCode is OTHER)' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  customReason?: string;

  @ApiProperty({ description: 'Details describing the issue with this review' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  details: string;
}
