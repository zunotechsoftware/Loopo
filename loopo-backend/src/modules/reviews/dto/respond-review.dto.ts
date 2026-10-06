import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RespondReviewDto {
  @ApiProperty({ description: 'Seller response content', example: 'Thanks for the kind words! Great buyer to deal with.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
