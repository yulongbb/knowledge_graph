import { Controller, Get, Param, Query } from '@nestjs/common';
import { XControllerService, XIdType, XQuery } from '@ng-nest/api/core';
import { Schema } from 'src/ontology/entities/schema.entity';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

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
  
  @Get('name/:name')
  async getSchemaByName(
    @Param('name') name: string,
    @Query('namespaceId') namespaceId?: string
  ): Promise<Schema> {
    if (namespaceId) {
      return await this.schemasService.getByNameAndNamespace(name, namespaceId);
    }
    return await this.schemasService.getByName(name);
  }
  
  @Get('namespace/:namespaceId')
  async findAllByNamespace(@Param('namespaceId') namespaceId: string): Promise<Schema[]> {
    return this.schemasService.findAllByNamespace(namespaceId);
  }
}
