import { Controller, Get, Param, Query } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { DictionaryService } from '../services/dictionary.service';
import { Dictionary } from '../entities/dictionary.entity';

@Controller('dictionary')
@ApiTags('数据字典')
export class DictionaryController extends XControllerService<Dictionary, XQuery> {
  constructor(public readonly dictionaryService: DictionaryService) {
    super(dictionaryService);
  }

  @Get('property/:propertyId')
  findByPropertyId(
    @Param('propertyId') propertyId: string,
    @Query('namespaceId') namespaceId?: string
  ): Promise<Dictionary[]> {
    if (namespaceId) {
      return this.dictionaryService.findByPropertyIdAndNamespace(propertyId, namespaceId);
    }
    return this.dictionaryService.findByPropertyId(propertyId);
  }
  
  @Get('namespace/:namespaceId')
  async findAllByNamespace(@Param('namespaceId') namespaceId: string): Promise<Dictionary[]> {
    return this.dictionaryService.findAllByNamespace(namespaceId);
  }
}
