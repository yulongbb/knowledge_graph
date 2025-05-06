import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { CreateScriptDto } from './create-script.dto';

export class TestScriptDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateScriptDto)
  script: CreateScriptDto;

  @IsObject()
  sampleData: any;
}
