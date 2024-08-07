import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { EdgeService } from './edge.service';
import { XIdType } from 'src/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('edge')
@ApiTags('知识融合') // 分组
export class EdgeController {
  constructor(private readonly nodeService: EdgeService) {}

  @Post(':size/:index')
  getLinks(
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): any {
    return this.nodeService.getLinks(index, size, query);
  }

  @Get('property/:size/:index')
  getProperties(
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
  ): any {
    return this.nodeService.getProperties(index, size);
  }

  @Delete(':id')
  deleteEdge(@Param('id') id: XIdType): any {
    return this.nodeService.deleteEdge(id);
  }
}
