import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportTargetTypeDto {
  LISTING = 'LISTING',
  USER = 'USER',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  CATEGORY = 'CATEGORY',
  SYSTEM = 'SYSTEM',
}

export class EvidenceDto {
  @ApiProperty({ description: 'Type of evidence', example: 'IMAGE' })
  @IsString()
  @IsNotEmpty()
  type: string; // IMAGE, VIDEO, DOCUMENT, URL, TEXT

  @ApiPropertyOptional({ description: 'S3 URL or external URL', example: 'https://loopo-s3.s3.amazonaws.com/evidence.jpg' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Optional text context or explanation', example: 'Screenshot of the spam message.' })
  @IsString()
  @IsOptional()
  textNotes?: string;
}

export class CreateReportDto {
  @ApiProperty({ description: 'The entity type being reported', enum: ReportTargetTypeDto, example: 'LISTING' })
  @IsEnum(ReportTargetTypeDto)
  @IsNotEmpty()
  targetType: ReportTargetTypeDto;

  @ApiProperty({ description: 'ID of the reported target item', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ description: 'Reason code for the report', example: 'SPAM' })
  @IsString()
  @IsNotEmpty()
  reasonCode: string;

  @ApiPropertyOptional({ description: 'Custom reason (applicable if code is OTHER)', example: 'Item price is dynamically changing every hour.' })
  @IsString()
  @IsOptional()
  customReason?: string;

  @ApiProperty({ description: 'Detailed feedback describing the violation', example: 'This listing contains duplicate photos and is spamming the category.' })
  @IsString()
  @IsNotEmpty()
  details: string;

  @ApiPropertyOptional({ description: 'Evidence files/notes supporting the claim', type: [EvidenceDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence?: EvidenceDto[];
}
