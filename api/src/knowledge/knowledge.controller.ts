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
  Query,
  DefaultValuePipe,
  NotFoundException,
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
import { 
  BatchTask, 
  BatchTaskResponse, 
  CreateBatchTaskDto, 
  UpdateBatchTaskDto 
} from './models/batch-task.model';
import { BatchTaskService } from './batch-task.service';

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
    private readonly batchTaskService: BatchTaskService,
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
    description: '根据条件搜索知识实体，支持分页和高级查询，可按命名空间过滤' 
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
        namespaces: {  // Add namespace aggregation
          terms: {
            field: 'namespace.keyword',
            size: 100,
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

  @Post('batch-task')
  @ApiOperation({ 
    summary: '创建批处理任务', 
    description: '创建一个新的批处理任务，用于批量处理实体' 
  })
  @ApiBody({ description: '批处理任务数据，包含类型和实体ID列表', type: CreateBatchTaskDto })
  @ApiResponse({ status: 201, description: '批处理任务创建成功', type: BatchTaskResponse })
  async createBatchTask(@Body() createTaskDto: CreateBatchTaskDto): Promise<BatchTaskResponse> {
    try {
      const task = await this.batchTaskService.createTask(createTaskDto);
      return { 
        success: true, 
        message: '批处理任务创建成功', 
        data: task 
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: `创建批处理任务失败: ${error.message}` },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('batch-task/:id')
  @ApiOperation({ 
    summary: '获取批处理任务', 
    description: '通过ID获取批处理任务详情' 
  })
  @ApiParam({ name: 'id', description: '批处理任务ID' })
  @ApiResponse({ status: 200, description: '批处理任务详情', type: BatchTask })
  async getBatchTask(@Param('id') id: string): Promise<BatchTask> {
    try {
      return await this.batchTaskService.getTaskById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          { success: false, message: error.message },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { success: false, message: `获取批处理任务失败: ${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('batch-tasks')
  @ApiOperation({ 
    summary: '获取批处理任务列表', 
    description: '获取所有批处理任务的列表，支持分页' 
  })
  @ApiResponse({ status: 200, description: '批处理任务列表', type: [BatchTask] })
  async getBatchTasks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ): Promise<{ total: number, items: BatchTask[] }> {
    return await this.batchTaskService.getAllTasks(page, pageSize);
  }

  @Put('batch-task')
  @ApiOperation({ 
    summary: '更新批处理任务', 
    description: '更新批处理任务的状态、进度等信息' 
  })
  @ApiBody({ description: '批处理任务更新数据', type: UpdateBatchTaskDto })
  @ApiResponse({ status: 200, description: '批处理任务更新成功', type: BatchTaskResponse })
  async updateBatchTask(@Body() updateTaskDto: UpdateBatchTaskDto): Promise<BatchTaskResponse> {
    try {
      const task = await this.batchTaskService.updateTask(updateTaskDto);
      return { 
        success: true, 
        message: '批处理任务更新成功', 
        data: task 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          { success: false, message: error.message },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { success: false, message: `更新批处理任务失败: ${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('batch-task/:id')
  @ApiOperation({ 
    summary: '删除批处理任务', 
    description: '删除指定ID的批处理任务' 
  })
  @ApiParam({ name: 'id', description: '批处理任务ID' })
  @ApiResponse({ status: 200, description: '批处理任务删除成功', type: BatchTaskResponse })
  async deleteBatchTask(@Param('id') id: string): Promise<BatchTaskResponse> {
    try {
      const result = await this.batchTaskService.deleteTask(id);
      return { 
        success: result.success, 
        message: result.message 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          { success: false, message: error.message },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { success: false, message: `删除批处理任务失败: ${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
