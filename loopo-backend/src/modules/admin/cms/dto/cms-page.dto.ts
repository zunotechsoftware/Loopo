import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCmsPageDto {
  @ApiProperty({ description: 'Title of the page' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'URL slug for the page' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'HTML or Markdown content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'SEO Title' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO Description' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'Whether the page is published' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateCmsPageDto extends CreateCmsPageDto {}
