import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'The unique name of the role', example: 'MODERATOR' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Description of role capabilities', example: 'Can review content and flag users' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'The unique name of the role', example: 'MODERATOR_SENIOR' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Description of role capabilities', example: 'Elevated moderation powers' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class AssignRoleDto {
  @ApiProperty({ description: 'UUID of the role to assign', example: 'd3b07384-d113-49cd-a5d6-89b071e6212d' })
  @IsNotEmpty()
  @IsString()
  roleId: string;
}
