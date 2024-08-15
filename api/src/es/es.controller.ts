// redis.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EsService } from './es.service';

@Controller('es')
export class EsController {
  constructor(private readonly elasticsearchService: EsService) {}

 
  @Post('search')
  async search(@Body() bool: any,) {
    return await this.elasticsearchService.search({
      index: 'entity', body: {
        size: 100,
        query: {
          bool: bool
        }
      }
    });
  }
}

