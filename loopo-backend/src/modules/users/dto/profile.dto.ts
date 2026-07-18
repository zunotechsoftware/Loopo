import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsJSON, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'User first name', example: 'John' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Display name visible to other users', example: 'john_doe_99' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: 'A short bio of the seller', example: 'Experienced local electronics vendor' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Primary contact email for profile updates', example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Profile contact phone number', example: '+15550199' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Gender identification', example: 'Male' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  gender?: string;

  @ApiPropertyOptional({ description: 'Country location name', example: 'United States' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'State / Province / Region', example: 'California' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'City location', example: 'San Francisco' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Postal or Zip Code', example: '94105' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Preferred communication language', example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferredLanguage?: string;

  @ApiPropertyOptional({ description: 'Local Timezone code', example: 'America/Los_Angeles' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ description: 'Personal or seller business website URL', example: 'https://johnsellselectronics.com' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'JSON object representing social link platforms and URLs', example: { twitter: 'https://twitter.com/john', facebook: 'https://facebook.com/john' } })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;
}
