import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Qualify } from 'src/ontology/entities/qualify.entity';
import { QualifiersService } from 'src/ontology/services/qualifiers.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('qualifers')
@ApiTags('本体建模') // 分组
export class QualifiersController extends XControllerService<Qualify, XQuery> {
  constructor(public readonly  qualifiersService: QualifiersService) {
    super(qualifiersService);
  }

  @Get('label/:label')
  async getQualifyByLabel(@Param('label') label: string,): Promise<Qualify[]> {
    return await this.qualifiersService.getQualifyByLabel(label);
  }

}
