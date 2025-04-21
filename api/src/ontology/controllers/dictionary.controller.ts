import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { DictionaryService } from '../services/dictionary.service';
import { Dictionary } from '../entities/dictionary.entity';

@Controller('dictionary')
@ApiTags('数据字典')
export class DictionaryController extends XControllerService<Dictionary, XQuery> {
  constructor(public readonly dictionaryService: DictionaryService) {
    super(dictionaryService);
  }

  @Get('property/:propertyId')
  findByPropertyId(@Param('propertyId') propertyId: string): Promise<Dictionary[]> {
    return this.dictionaryService.findByPropertyId(propertyId);
  }
}
