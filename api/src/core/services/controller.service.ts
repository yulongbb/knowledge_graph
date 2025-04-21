import {
  Injectable,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { XRepositoryService } from './repository.service';
import { XId, XResultList, XGroupItem, XQuery, XIdType } from '../interfaces';
import { ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

/**
 * 通用控制器基类
 * 提供基础的CRUD操作接口
 * @typeparam Entity 实体类型，必须继承XId
 * @typeparam Query 查询参数类型，必须继承XQuery
 */
@Injectable()
export class XControllerService<Entity extends XId, Query extends XQuery> {
  constructor(private readonly service: XRepositoryService<Entity, Query>) {}

  /**
   * 获取分页列表数据
   * @param index 页码
   * @param size 每页大小
   * @param query 查询条件
   * @returns 分页结果，包含总数和数据列表
   */
  @Post(':size/:index')
  @ApiOperation({ summary: '获取分页列表', description: '根据查询条件获取分页数据列表' })
  @ApiParam({ name: 'index', description: '页码', type: Number })
  @ApiParam({ name: 'size', description: '每页数量', type: Number })
  @ApiBody({ description: '查询条件' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getList(
    @Param('index', new ParseIntPipe()) index: number = 1,
    @Param('size', new ParseIntPipe()) size: number = 10,
    @Body() query: Query,
  ): Promise<XResultList<Entity | XGroupItem>> {
    return await this.service.getList(index, size, query);
  }

  /**
   * 获取单个实体
   * @param id 实体ID
   * @returns 实体对象
   */
  @Get(':id')
  @ApiOperation({ summary: '获取详情', description: '根据ID获取单条数据详情' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async get(@Param('id') id: XIdType): Promise<Entity> {
    return await this.service.get(id);
  }

  /**
   * 创建实体
   * @param entity 实体对象
   * @returns 创建后的实体
   */
  @Post()
  @ApiOperation({ summary: '创建', description: '创建新的数据记录' })
  @ApiBody({ description: '创建的数据对象' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async post(@Body() entity: Entity): Promise<Entity> {
    return await this.service.post(entity);
  }

  /**
   * 更新实体
   * @param entity 实体对象
   * @returns 更新后的实体
   */
  @Put()
  @ApiOperation({ summary: '更新', description: '更新已有的数据记录' })
  @ApiBody({ description: '更新的数据对象' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async put(@Body() entity: Entity): Promise<Entity> {
    return await this.service.put(entity);
  }

  /**
   * 删除实体
   * @param id 实体ID
   * @returns 被删除的实体
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除', description: '根据ID删除数据记录' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: XIdType): Promise<Entity> {
    return await this.service.delete(id);
  }
}
