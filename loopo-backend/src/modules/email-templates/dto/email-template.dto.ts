import { IsString, IsEnum, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TemplateCategory, TemplateStatus } from '@prisma/client';

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'Welcome Email' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, example: 'User Welcome' })
  @IsString()
  @IsOptional()
  subtext?: string;

  @ApiProperty({ enum: TemplateCategory, example: TemplateCategory.MARKETING })
  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @ApiProperty({ example: 'Welcome to Loopo! 👋' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ required: false, example: 'English', default: 'English' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ enum: TemplateStatus, required: false, default: TemplateStatus.ACTIVE })
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;
}

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {}
