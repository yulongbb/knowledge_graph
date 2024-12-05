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
import { KnowledgeService } from './knowledge.service';
import { XIdType } from 'src/core';
import { ApiTags } from '@nestjs/swagger';
import { EsService } from './es.service';
import { NLPService } from './nlp.service';
import { EdgeService } from './edge.service';
import { query } from 'express';

@Controller('knowledge')
@ApiTags('知识融合') // 分组
export class KnowledgeController {

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly elasticsearchService: EsService,
    private readonly nlpSevice: NLPService,
    private readonly edgeService: EdgeService
  ) { }

  @Post('')
  async addEntity(@Body() entity: any): Promise<any> {
    return await this.knowledgeService.addEntity(entity);
  }

  @Delete(':id')
  deleteEntity(@Param('id') id: XIdType): any {
    console.log(id);
    return this.knowledgeService.deleteEntity(id);
  }

  @Put('')
  async updateEntity(@Body() entity: any): Promise<any> {
    return await this.knowledgeService.updateEntity(entity);
  }

  @Post('search/:size/:index')
  async searchEntity(@Param('index', new ParseIntPipe())
  index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 20, @Body() bool: any,) {
    return await this.elasticsearchService.search(
      {
        size: size,
        from: (index - 1) * size,
        query: bool,
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
          },
          tags: {
            terms: {
              field: "tags.keyword",
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
    );
  }

  @Get('get/:id')
  async get(@Param('id') id: any,) {
    return await this.elasticsearchService.get(id).then((data: any) => {
      if (data._source.descriptions) {
        let entities = this.nlpSevice.extractEntities(data._source?.descriptions?.zh?.value);
        data._source['entities'] = entities;
      }
      return data;
    })
  }

  @Post("fusion")
  async fusion(@Body() entity: any): Promise<any> {
    return await this.knowledgeService.fusion({ entity });
  }

  @Post('restore')
  async restore(@Body() entity: any): Promise<any> {
    return await this.knowledgeService.restore({ entity });
  }

  @Get('sync')
  async syncDataToTxt() {
    return await this.elasticsearchService.syncDataToTxt();
  }

  @Post('link')
  async addEdge(@Body() edge: any): Promise<any> {
    return await this.edgeService.addEdge(edge);
  }

  @Put('link')
  async updateEdge(@Body() edge: any): Promise<any> {
    return await this.edgeService.updateEdge(edge);
  }

  @Delete('link/:id')
  deleteEdge(@Param('id') id: XIdType): any {
    return this.edgeService.deleteEdge(id);
  }


  @Post('link/:id/:size/:index')
  async link(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): Promise<any> {
    console.log(id);
    return this.knowledgeService.link(id, index, size, query);;
  }



  @Post('graph/:id/:size/:index')
  async graph(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: any,
  ): Promise<any> {
    console.log(id);
    return this.knowledgeService.graph(id, index, size, query);
  }
}
