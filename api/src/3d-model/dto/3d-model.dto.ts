import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateModelDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsArray()
  @IsOptional()
  tags: string[] = [];
}

export class UpdateModelDto extends CreateModelDto {
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  previewUrl?: string;
}

export class SearchModelDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
