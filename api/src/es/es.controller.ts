// redis.controller.ts

import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EsService } from './es.service';
import { NLPService } from './nlp.service';

@Controller('es')
export class EsController {
  constructor(private readonly elasticsearchService: EsService, private readonly nlpSevice: NLPService) { }


  @Post('search/:size/:index')
  async search(@Param('index', new ParseIntPipe())
  index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10, @Body() bool: any,) {
    return await this.elasticsearchService.search({
      index: 'entity', body: {
        size: size,
        from: (index - 1) * size,
        query: {
          bool: bool
        },
        sort: [
          {
            modified: {
              order: "desc"
            }
          }
        ],
        aggs: {
          types: {
            terms: {
              field: "type.keyword",
              size: 20000
            }
          }
        },
        highlight: {
          fields: {
            "labels.zh.value": {
              pre_tags: [
                "<strong>"
              ],
              post_tags: [
                "</strong>"
              ]
            },
            "descriptions.zh.value": {
              pre_tags: [
                "<strong>"
              ],
              post_tags: [
                "</strong>"
              ]
            }
          }
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

  @Get('get/:id')
  async get(@Param('id') id: any,) {
    
    return await this.elasticsearchService.get(id).then((data:any)=>{
      if(data._source.descriptions){
        let entities = this.nlpSevice.extractEntities(data._source?.descriptions?.zh?.value);
        data._source['entities'] = entities;
      }

      return data;
    })
  }

  @Get('sync')
  async syncDataToTxt() {
    
    return await this.elasticsearchService.syncDataToTxt();
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


