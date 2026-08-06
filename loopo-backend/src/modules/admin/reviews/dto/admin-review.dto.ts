import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewVisibilityDto {
  @ApiProperty({ description: 'Whether the review should be visible to users' })
  @IsBoolean()
  @IsNotEmpty()
  isVisible: boolean;
}
