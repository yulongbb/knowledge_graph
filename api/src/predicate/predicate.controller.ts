import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Body,
    Delete,
    Put,
} from '@nestjs/common';
import { PredicateService } from './predicate.service';
import { XIdType } from 'src/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('predicate')
@ApiTags('谓词管理') // 分组
export class PredicateController {
    constructor(private readonly predicateService: PredicateService) { }

    @Get(':id')
    getPredicate(@Param('id') id: string): any {
      return this.predicateService.getPredicate(id);
    }

    @Post('')
    async addPredicate(@Body() predicate: any): Promise<any> {
      return await this.predicateService.addPredicate(predicate);
    }
  
    @Put('')
    async updatePredicate(@Body() predicate: any): Promise<any> {
      return await this.predicateService.updatePredicate(predicate);
    }
  
}