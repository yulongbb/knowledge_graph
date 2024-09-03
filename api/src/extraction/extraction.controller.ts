import {
  Controller,

} from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Extraction } from './extraction.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('extraction')
@ApiTags('本体建模') // 分组
export class ExtractionController extends XControllerService<
  Extraction,
  XQuery
> {
  constructor(public readonly extractionService: ExtractionService) {
    super(extractionService);
  }
}
