import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  @MaxLength(200)
  query: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;
}

export class UpdateSavedSearchDto {
  @IsBoolean()
  notificationsEnabled: boolean;
}
