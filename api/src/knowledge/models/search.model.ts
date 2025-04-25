import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 搜索条件操作符
 */
export enum SearchOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_EQUALS = '>=',
  LESS_THAN_EQUALS = '<=',
  LIKE = 'like',
  NOT_LIKE = 'not like',
  IN = 'in',
  NOT_IN = 'not in',
}

/**
 * 关系操作符
 */
export enum RelationOperator {
  AND = 'and',
  OR = 'or',
}

/**
 * 搜索条件模型
 */
export class SearchCondition {
  @ApiProperty({ description: '字段名称', example: 'labels.zh.value' })
  field: string;

  @ApiProperty({ description: '搜索值', example: '人工智能' })
  value: string | number | boolean | Array<string | number>;

  @ApiPropertyOptional({ description: '操作符', enum: SearchOperator, example: '=' })
  operation?: SearchOperator;

  @ApiPropertyOptional({ description: '关系操作符', enum: RelationOperator, example: 'and' })
  relation?: RelationOperator;
}

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 搜索查询模型
 */
export class SearchQuery {
  @ApiPropertyOptional({ description: '过滤条件', type: [SearchCondition], isArray: true })
  filter?: SearchCondition[];

  @ApiPropertyOptional({ description: '排序字段', type: Object, example: { 'modified': 'desc' } })
  sort?: Record<string, SortDirection>;

  @ApiPropertyOptional({ description: '高亮字段', type: [String], isArray: true })
  highlight?: string[];
}

/**
 * 聚合桶项模型
 */
export class AggregationBucket {
  @ApiProperty({ description: '桶键值', example: 'E1' })
  key: string;

  @ApiProperty({ description: '文档数量', example: 42 })
  doc_count: number;
}

/**
 * 聚合结果模型
 */
export class Aggregation {
  @ApiProperty({ description: '聚合桶', type: [AggregationBucket] })
  buckets: AggregationBucket[];
}

/**
 * Elasticsearch 源文档数据
 */
export interface ElasticsearchSource {
  [key: string]: any;
}

/**
 * 搜索命中结果模型
 */
export interface SearchHit<T = ElasticsearchSource> {
  _id: string;
  _score?: number;
  _source: T;
  highlight?: Record<string, string[]>;
}

/**
 * 搜索响应模型
 */
export class SearchResponse<T = ElasticsearchSource> {
  @ApiProperty({ description: '总命中数', example: 42 })
  total: number;

  @ApiProperty({ description: '命中列表', type: Array })
  list: SearchHit<T>[];

  @ApiPropertyOptional({ description: '类型聚合', type: Aggregation })
  types?: Aggregation;

  @ApiPropertyOptional({ description: '标签聚合', type: Aggregation })
  tags?: Aggregation;
}

/**
 * 搜索分页请求
 */
export class SearchPaginationRequest {
  @ApiProperty({ description: '页码', example: 1 })
  index: number;

  @ApiProperty({ description: '每页大小', example: 20 })
  size: number;

  @ApiProperty({ description: '搜索查询', type: SearchQuery })
  query: SearchQuery;
}

/**
 * 数据导入响应
 */
export class ImportResponse {
  @ApiProperty({ description: '操作状态', example: true })
  success: boolean;
  
  @ApiProperty({ description: '消息', example: 'Data import request has been submitted successfully.' })
  message: string;
  
  @ApiPropertyOptional({ description: '任务ID', example: '12345' })
  jobId?: string;
}
