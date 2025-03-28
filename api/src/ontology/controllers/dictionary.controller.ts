import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DictionaryService } from '../services/dictionary.service';
import { Dictionary } from '../entities/dictionary.entity';

@Controller('dictionary')
@ApiTags('数据字典')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get()
  findAll(): Promise<Dictionary[]> {
    return this.dictionaryService.findAll();
  }

  @Get('property/:propertyId')
  findByPropertyId(@Param('propertyId') propertyId: string): Promise<Dictionary[]> {
    return this.dictionaryService.findByPropertyId(propertyId);
  }

  @Post()
  create(@Body() dictionary: Dictionary): Promise<Dictionary> {
    return this.dictionaryService.create(dictionary);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dictionary: Dictionary): Promise<Dictionary> {
    return this.dictionaryService.update(id, dictionary);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.dictionaryService.delete(id);
  }
}
