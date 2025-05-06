import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['extraction', 'transformation', 'cleaning'])
  type: 'extraction' | 'transformation' | 'cleaning';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['javascript', 'python', 'sql'])
  language: 'javascript' | 'python' | 'sql';

  @IsOptional()
  tags?: string[];
}
