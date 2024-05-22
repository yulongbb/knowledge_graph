import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { NodeService } from './node.service';
import { XIdType } from 'src/core';
import { ApiTags } from '@nestjs/swagger';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { FusionService } from 'src/fusion/fusion.service';

@Controller('node')
@ApiTags('知识融合') // 分组
export class NodeController {
  constructor(private readonly nodeService: NodeService, private readonly fusionService: FusionService, private readonly propertiesService: PropertiesService) { }

  @Post('')
  async addEntity(@Body() entity: any): Promise<any> {
    return await this.nodeService.addEntity(entity);
  }

  @Put('')
  async updateEntity(@Body() entity: any): Promise<any> {
    return await this.nodeService.updateEntity(entity);
  }

  @Delete(':id')
  deleteEntity(@Param('id') id: XIdType): any {
    return this.nodeService.deleteEntity(id);
  }

  @Post(':size/:index')
  getEntityList(
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): any {
    return this.nodeService.getEntityList(index, size, query);
  }

  @Get(':id')
  getEntity(@Param('id') id: XIdType): any {
    return this.nodeService.getEntity(id);
  }

  @Post('link/:id/:size/:index')
  async getLinks(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): Promise<any> {
    let claims = {};
    const properties = await this.propertiesService.getList(1, 20, { 'filter': [{ field: 'id', value: query.schema, relation: 'schemas', operation: '=' }] });
    const links = await this.fusionService.getLinks(id, index, size, query);
    properties.list.forEach((p) => {
      claims[p['name']] = links.list.filter((l) => l.mainsnak.property == 'P' + p['id']);
    })
    return claims;

  }

  // @Get('property/:size/:index')
  // getProperties(
  //   @Param('index', new ParseIntPipe())
  //   index: number = 1,
  //   @Param('size', new ParseIntPipe())
  //   size: number = 10,
  // ): any {
  //   return this.fusionService.getProperties(index, size);
  // }
}
