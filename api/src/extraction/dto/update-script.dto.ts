import { PartialType } from '@nestjs/mapped-types';
import { CreateScriptDto } from './create-script.dto';

export class UpdateScriptDto extends PartialType(CreateScriptDto) {}
