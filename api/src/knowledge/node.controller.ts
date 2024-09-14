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
import { KnowledgeService } from './knowledge.service';

@Controller('node')
@ApiTags('知识融合') // 分组
export class NodeController {
  constructor(
    private readonly nodeService: NodeService,
   ) { }

  @Post('')
  async addNode(@Body() entity: any): Promise<any> {
    return await this.nodeService.addNode(entity);
  }

  @Delete(':id')
  deleteNode(@Param('id') id: XIdType): any {
    return this.nodeService.deleteNode(id);
  }

  @Put('')
  async updateNode(@Body() entity: any): Promise<any> {
    return await this.nodeService.updateNode(entity);
  }

  @Post(':size/:index')
  getNodeList(
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): any {
    return this.nodeService.getNodeList(index, size, query);
  }

  @Get(':id')
  getNode(@Param('id') id: XIdType): any {
    return this.nodeService.getNode(id);
  }

  @Post('link/:id/:size/:index')
  async graph(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): Promise<any> {
    console.log(id);
    return  this.nodeService.graph(id, index, size, query);;
  }

}
