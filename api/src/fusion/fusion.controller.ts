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
import { FusionService } from './fusion.service';
import { XIdType } from 'src/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('fusion')
@ApiTags('知识融合') // 分组
export class FusionController {
  constructor(private readonly fusionService: FusionService) {}

  @Post()
  async addEntity(@Body() entity: any): Promise<any> {
    return await this.fusionService.addEntity(entity);
  }

  @Put()
  async updateEntity(@Body() entity: any): Promise<any> {
    return await this.fusionService.updateEntity(entity);
  }

  @Delete('entity/:id')
  deleteEntity(@Param('id') id: XIdType): any {
    return this.fusionService.deleteEntity(id);
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
    return this.fusionService.getEntityList(index, size, query, db);
  }

  @Get('entity/:id')
  getEntity(@Param('id') id: XIdType): any {
    return this.fusionService.getEntity(id);
  }

  @Post('link/:id/:size/:index')
  getLinks(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): any {
    return this.fusionService.getLinks(id, index, size, query);
  }

  @Get('property/:size/:index')
  getProperties(
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
  ): any {
    return this.fusionService.getProperties(index, size);
  }
}
