import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { XIdType } from 'src/core';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { EsService } from './es.service';
import { NLPService } from './nlp.service';
import { EdgeService } from './edge.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataImportService } from './data-import.queue';
import { 
  Entity, 
  EntityWithExtracted, 
  Edge, 
  SearchQuery, 
  SearchResponse,
  KnowledgeGraph,
  JobStatusInfo,
  ImportResponse,
  TemplateRenderResponse
} from './models';
import { ExtendedEdge } from './edge.service';

@Controller('knowledge')
@ApiTags('知识融合') // 分组
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly elasticsearchService: EsService,
    private readonly nlpSevice: NLPService,
    private readonly edgeService: EdgeService,
    private readonly dataImportService: DataImportService,
    @InjectQueue('data-import-queue') private queue: Queue,
  ) {}

  @Post('')
  @ApiOperation({ summary: '添加知识实体', description: '创建一个新的知识实体到系统中' })
  @ApiBody({ description: '知识实体数据，包含标签、描述、别名等信息', type: Entity })
  @ApiResponse({ status: 201, description: '知识实体创建成功', type: Entity })
  async addEntity(@Body() entity: Entity): Promise<Entity> {
    return await this.knowledgeService.addEntity(entity);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除知识实体', description: '根据ID删除指定的知识实体' })
  @ApiParam({ name: 'id', description: '知识实体的唯一标识' })
  @ApiResponse({ status: 200, description: '知识实体删除成功' })
  deleteEntity(@Param('id') id: XIdType): any {
    console.log(id);
    return this.knowledgeService.deleteEntity(id);
  }

  @Put('')
  @ApiOperation({ summary: '更新知识实体', description: '更新现有的知识实体信息' })
  @ApiBody({ description: '更新的知识实体数据，需包含实体ID', type: Entity })
  @ApiResponse({ status: 200, description: '知识实体更新成功', type: Entity })
  async updateEntity(@Body() entity: Entity): Promise<any> {
    return await this.knowledgeService.updateEntity(entity);
  }

  @Post('search/:size/:index')
  @ApiOperation({ 
    summary: '搜索知识实体', 
    description: '根据条件搜索知识实体，支持分页和高级查询' 
  })
  @ApiParam({ name: 'index', description: '页码，从1开始' })
  @ApiParam({ name: 'size', description: '每页数量' })
  @ApiBody({ description: '搜索条件，Elasticsearch查询DSL格式', type: SearchQuery })
  @ApiResponse({ status: 200, description: '搜索结果，包含实体列表和聚合数据', type: SearchResponse })
  async searchEntity(
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 20,
    @Body() bool: any,
  ): Promise<SearchResponse> {
    return await this.elasticsearchService.search({
      size: size,
      from: (index - 1) * size,
      query: bool,
      // sort: [
      //   {
      //     modified: {
      //       order: 'desc',
      //     },
      //   },
      // ],
      aggs: {
        types: {
          terms: {
            field: 'type.keyword',
            size: 20000,
          },
        },
        tags: {
          terms: {
            field: 'tags.keyword',
            size: 20000,
          },
        },
      },
      highlight: {
        fields: {
          'labels.zh.value': {
            pre_tags: ["<i style='color:red'>"],
            post_tags: ['</i>'],
          },
          'descriptions.zh.value': {
            pre_tags: ["<i style='color:red'>"],
            post_tags: ['</i>'],
          },
        },
      },
    });
  }

  @Get('get/:id')
  @ApiOperation({ summary: '获取知识实体详情', description: '根据ID获取知识实体的详细信息' })
  @ApiParam({ name: 'id', description: '知识实体的唯一标识' })
  @ApiResponse({ status: 200, description: '知识实体详细信息，包含自动提取的实体', type: EntityWithExtracted })
  async get(@Param('id') id: any): Promise<EntityWithExtracted> {
    return await this.elasticsearchService.get(id).then((data: any) => {
      if (data._source.descriptions) {
        let entities = this.nlpSevice.extractEntities(
          data._source?.descriptions?.zh?.value,
        );
        data._source['entities'] = entities;
      }
      return data;
    });
  }

  @Post('fusion')
  @ApiOperation({ 
    summary: '知识融合', 
    description: '将多个知识实体融合为一个，合并其属性和关系' 
  })
  @ApiBody({ description: '需要融合的实体信息，包含多个实体ID' })
  @ApiResponse({ status: 200, description: '融合后的知识实体信息', type: Entity })
  async fusion(@Body() entity: any): Promise<any> {
    return await this.knowledgeService.fusion({ entity });
  }

  @Post('restore')
  @ApiOperation({ 
    summary: '恢复知识实体', 
    description: '恢复之前融合的知识实体到原始状态' 
  })
  @ApiBody({ description: '需要恢复的知识实体信息' })
  @ApiResponse({ status: 200, description: '恢复操作的结果' })
  async restore(@Body() entity: any): Promise<any> {
    return await this.knowledgeService.restore({ entity });
  }

  @Get('sync')
  @ApiOperation({ 
    summary: '同步数据到文本文件', 
    description: '将知识库中的数据同步到文本文件，用于自然语言处理' 
  })
  @ApiResponse({ status: 200, description: '同步操作的结果' })
  async syncDataToTxt() {
    return await this.elasticsearchService.syncDataToTxt();
  }

  @Post('link')
  @ApiOperation({ 
    summary: '添加关系', 
    description: '在两个知识实体之间建立关系' 
  })
  @ApiBody({ description: '关系信息，包含源实体、目标实体和关系类型', type: Edge })
  @ApiResponse({ status: 201, description: '关系创建成功', type: Edge })
  async addEdge(@Body() edge: Edge): Promise<Edge> {
    // Cast to any as an intermediate step to allow flexibility between Edge and ExtendedEdge
    return await this.edgeService.addEdge(edge as any);
  }

  @Put('link')
  @ApiOperation({ 
    summary: '更新关系', 
    description: '更新两个知识实体之间的关系' 
  })
  @ApiBody({ description: '更新的关系信息', type: Edge })
  @ApiResponse({ status: 200, description: '关系更新成功', type: Edge })
  async updateEdge(@Body() edge: Edge): Promise<Edge> {
    // Cast to any as an intermediate step to allow flexibility between Edge and ExtendedEdge
    return await this.edgeService.updateEdge(edge as any);
  }

  @Delete('link/:id')
  @ApiOperation({ 
    summary: '删除关系', 
    description: '删除指定ID的关系' 
  })
  @ApiParam({ name: 'id', description: '关系的唯一标识' })
  @ApiResponse({ status: 200, description: '关系删除成功' })
  deleteEdge(@Param('id') id: XIdType): any {
    return this.edgeService.deleteEdge(id);
  }

  @Post('link/:id/:size/:index')
  @ApiOperation({ 
    summary: '获取实体关系', 
    description: '获取指定实体的关系列表，支持分页' 
  })
  @ApiParam({ name: 'id', description: '知识实体的唯一标识' })
  @ApiParam({ name: 'index', description: '页码，从1开始' })
  @ApiParam({ name: 'size', description: '每页数量' })
  @ApiBody({ description: '查询条件，可选', type: SearchQuery })
  @ApiResponse({ status: 200, description: '实体关系列表' })
  async link(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: SearchQuery,
  ): Promise<any> {
    console.log(id);
    return this.knowledgeService.link(id, index, size, query);
  }

  @Post('graph/:id/:size/:index')
  @ApiOperation({ 
    summary: '获取知识图谱', 
    description: '获取以指定实体为中心的知识图谱，支持分页，返回适合可视化的数据结构' 
  })
  @ApiParam({ name: 'id', description: '中心知识实体的唯一标识' })
  @ApiParam({ name: 'index', description: '页码，从1开始' })
  @ApiParam({ name: 'size', description: '每页关系数量' })
  @ApiBody({ description: '图谱查询条件，可选', type: SearchQuery })
  @ApiResponse({ status: 200, description: '知识图谱数据，包含节点和边信息', type: KnowledgeGraph })
  async graph(
    @Param('id') id: XIdType,
    @Param('index', new ParseIntPipe())
    index: number = 1,
    @Param('size', new ParseIntPipe())
    size: number = 10,
    @Body() query: SearchQuery,
  ): Promise<KnowledgeGraph> {
    console.log(id);
    return this.knowledgeService.graph(id, index, size, query);
  }

  @Get('jobs')
  @ApiOperation({ 
    summary: '获取队列任务状态', 
    description: '获取数据导入队列中的任务状态列表' 
  })
  @ApiResponse({ status: 200, description: '队列任务状态列表', type: [JobStatusInfo] })
  async getQueueStatus(): Promise<JobStatusInfo[]> {
    const jobs = await this.queue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
    ]);
    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      status: job.status,
      progress: job.progress,
    }));
  }

  @Post('import')
  @ApiOperation({ 
    summary: '导入数据', 
    description: '提交批量数据导入任务到队列中异步处理' 
  })
  @ApiBody({ description: '需要导入的数据列表', type: [Entity] })
  @ApiResponse({ status: 201, description: '数据导入任务已提交', type: ImportResponse })
  async importData(@Body() data: Entity[]): Promise<ImportResponse> {
    if (!data || data.length === 0) {
      throw new HttpException('No data provided', HttpStatus.BAD_REQUEST);
    }

    // 将数据添加到队列中
    const job = await this.dataImportService.addDataToQueue(data);

    return { 
      success: true, 
      message: 'Data import request has been submitted successfully.',
      jobId: job.id
    };
  }

  @Post('view')
  @ApiOperation({ 
    summary: '记录知识浏览', 
    description: '记录用户浏览知识的行为，用于统计热门知识' 
  })
  @ApiBody({ description: '被浏览的知识实体信息', type: Entity })
  @ApiResponse({ status: 200, description: '浏览记录已保存' })
  async recordView(@Body() knowledge: Entity): Promise<void> {
    console.log(knowledge);
    await this.knowledgeService.recordView(knowledge);
  }

  @Get('hot')
  @ApiOperation({ 
    summary: '获取热门知识', 
    description: '获取根据用户浏览量统计的热门知识列表' 
  })
  @ApiResponse({ status: 200, description: '热门知识列表，包含浏览量', type: [Entity] })
  async getHotKnowledge(): Promise<{ id: string; score: number }[]> {
    const hotKnowledge = await this.knowledgeService.getHotKnowledge();
    return hotKnowledge;
  }

  @Get('render/:id')
  @ApiOperation({ 
    summary: '渲染知识模板', 
    description: '使用Handlebars渲染知识实体的模板，生成HTML内容' 
  }) 
  @ApiParam({ name: 'id', description: '知识实体的唯一标识' })
  @ApiResponse({ status: 200, description: '渲染后的HTML内容', type: TemplateRenderResponse })
  async renderTemplate(@Param('id') id: string): Promise<TemplateRenderResponse> {
    try {
      const result = await this.knowledgeService.renderTemplate(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }
}
