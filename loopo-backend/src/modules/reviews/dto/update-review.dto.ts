import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RatingDto } from './create-review.dto';

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Updated review title' })
  @IsString() @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated review content' })
  @IsString() @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Updated rating', type: RatingDto })
  @ValidateNested()
  @Type(() => RatingDto)
  @IsOptional()
  rating?: RatingDto;
}
