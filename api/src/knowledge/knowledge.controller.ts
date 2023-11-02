import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Knowledge } from './knowledge.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('knowledge')
@ApiTags('知识库') // 分组
export class KnowledgeController extends XControllerService<
Knowledge,
  XQuery
> {
  constructor(public readonly extractionService: KnowledgeService) {
    super(extractionService);
  }
}
