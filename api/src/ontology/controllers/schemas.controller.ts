import { Controller, UseGuards, Get } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { AuthGuard } from '@nestjs/passport';
import { Schema } from 'src/ontology/entities/schema.entity';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { ApiTags } from '@nestjs/swagger';


@Controller('schemas')
@ApiTags('本体建模') // 分组
export class SchemasController extends XControllerService<Schema, XQuery> {
  constructor(public readonly schemasService: SchemasService) {
    super(schemasService);
  }

}
