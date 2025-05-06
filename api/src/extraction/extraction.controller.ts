import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { ApiTags } from '@nestjs/swagger';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Script } from './entities/script.entity';

@Controller('extraction')
@ApiTags('数据抽取转换') // 分组
export class ExtractionController extends XControllerService<Script, XQuery> {
  constructor(public readonly extractionService: ExtractionService) {
    super(extractionService);
  }

  @Get('scripts')
  async findAll(@Query('type') type?: string) {
    if (type) {
      return this.extractionService.findAllByType(type);
    }
    return this.extractionService.findAll();
  }

  @Get('script-types')
  async getScriptTypes() {
    return this.extractionService.getScriptTypes();
  }

  @Post('scripts')
  async create(@Body() createScriptDto: any) {
    return this.extractionService.create(createScriptDto);
  }

  @Get('scripts/:id')
  async findOne(@Param('id') id: string) {
    return this.extractionService.findOne(id);
  }

  @Put('scripts/:id')
  async update(@Param('id') id: string, @Body() updateScriptDto: any) {
    return this.extractionService.update(id, updateScriptDto);
  }

  @Delete('scripts/:id')
  async remove(@Param('id') id: string) {
    return this.extractionService.remove(id);
  }

  @Post('scripts/test')
  async testScript(@Body() testScriptDto: any) {
    return this.extractionService.testScript(testScriptDto);
  }
}
