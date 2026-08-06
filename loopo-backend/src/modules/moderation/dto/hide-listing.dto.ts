import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class HideListingDto {
  @ApiProperty({ description: 'The Product/Listing ID to hide', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' })
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @ApiPropertyOptional({ description: 'Related investigation case ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiProperty({ description: 'Reason for hiding the listing', example: 'Wrong product category selected.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
