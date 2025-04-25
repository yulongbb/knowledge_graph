import { Controller, Get, Param, Query } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Qualify } from 'src/ontology/entities/qualify.entity';
import { QualifiersService } from 'src/ontology/services/qualifiers.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@Controller('qualifers')
@ApiTags('本体建模') // 分组
export class QualifiersController extends XControllerService<Qualify, XQuery> {
  constructor(public readonly qualifiersService: QualifiersService) {
    super(qualifiersService);
  }

  @Get('label/:label')
  async getQualifyByLabel(
    @Param('label') label: string,
    @Query('namespaceId') namespaceId?: string
  ): Promise<Qualify[]> {
    if (namespaceId) {
      return await this.qualifiersService.getQualifyByLabelAndNamespace(label, namespaceId);
    }
    return await this.qualifiersService.getQualifyByLabel(label);
  }
  
  @Get('namespace/:namespaceId')
  async findAllByNamespace(@Param('namespaceId') namespaceId: string): Promise<Qualify[]> {
    return this.qualifiersService.findAllByNamespace(namespaceId);
  }
}
