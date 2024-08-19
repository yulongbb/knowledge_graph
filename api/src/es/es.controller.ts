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

  @Post('add')
  async add(@Body() doc: any,) {
    return await this.elasticsearchService.bulk({
      body: [
        // 指定的数据库为news, 指定的Id = 1
        { index: { _index: 'entity', _type: 'doc', _id: '1' } }, 
        { content: doc }
      ]
    });
  }


  @Get('aggs')
  async aggs() {
    return await this.elasticsearchService.aggs({
      index: 'entity', body: {
        "aggs": {
          "types": {
            "terms": {
              "field": "type.keyword"
            }
          }
        }
      }
    });
  }
}


