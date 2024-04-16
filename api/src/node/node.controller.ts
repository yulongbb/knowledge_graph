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

@Controller('node')
@ApiTags('知识融合') // 分组
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

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
    @Param('db')
    db: string = 'kgms',
    @Body() query: any,
  ): any {
    return this.nodeService.getEntityList(index, size, query, db);
  }

  @Get(':id')
  getEntity(@Param('id') id: XIdType): any {
    return this.nodeService.getEntity(id);
  }

  // @Post('link/:id/:size/:index')
  // getLinks(
  //   @Param('id') id: XIdType,
  //   @Param('index', new ParseIntPipe())
  //   index: number = 1,
  //   @Param('size', new ParseIntPipe())
  //   size: number = 10,
  //   @Body() query: any,
  // ): any {
  //   return this.fusionService.getLinks(id, index, size, query);
  // }

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
