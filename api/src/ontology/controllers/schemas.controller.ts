import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XIdType, XQuery } from '@ng-nest/api/core';
import { Schema } from 'src/ontology/entities/schema.entity';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('schemas')
@ApiTags('本体建模') // 分组
export class SchemasController extends XControllerService<Schema, XQuery> {
  constructor(public readonly schemasService: SchemasService) {
    super(schemasService);
  }

  @Get('children/:id')
  getChildren(@Param('id') id: XIdType): any {
    console.log(id);
    return this.schemasService.getChildren(id);
  }


  @Get('parent/:id')
  getParent(@Param('id') id: XIdType): any {
    return this.schemasService.getParent(id);
  }



}
