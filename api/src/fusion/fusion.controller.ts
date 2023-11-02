import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { FusionService } from './fusion.service';
import { XIdType, XQuery } from 'src/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('fusion')
@ApiTags('知识融合') // 分组

export class FusionController {
  constructor(private readonly fusionService: FusionService) {}

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

    return this.fusionService.getEntityList(index, size, query, db);
  }

  @Get('entity/:id')
  getEntity(@Param('id') id: XIdType): any {
    return this.fusionService.getEntity(id);
  }

  @Get('link/:id/:size/:index')
  getLinks(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
  ): any {
    return this.fusionService.getLinks(id, index, size);
  }
}
