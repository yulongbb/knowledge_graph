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
import { EdgeService } from './edge.service';
import { XIdType } from 'src/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('edge')
@ApiTags('知识融合') // 分组
export class EdgeController {
  constructor(private readonly nodeService: EdgeService) {}

  @Post(':size/:index')
  getLinks(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): any {
    return this.nodeService.getLinks(id, index, size, query);
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
}
