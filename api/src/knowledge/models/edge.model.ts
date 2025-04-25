import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 属性数据值类型定义
 */
export type DataValueType = 'string' | 'wikibase-entityid' | 'quantity' | 'monolingualtext' | 'time';

/**
 * 声明类型定义
 */
export type SnakType = 'value' | 'somevalue' | 'novalue';

/**
 * 关系等级定义
 */
export type RankType = 'normal' | 'preferred' | 'deprecated';

/**
 * 实体ID引用模型
 * 用于引用其他实体
 */
export class EntityReference {
  @ApiProperty({ description: '实体类型', example: 'item' })
  'entity-type': string;

  @ApiPropertyOptional({ description: '实体数值ID', example: 123 })
  'numeric-id'?: number;

  @ApiProperty({ description: '实体ID', example: 'Q123' })
  id: string;

  @ApiPropertyOptional({ description: '实体标签', example: '人工智能' })
  label?: string;
}

/**
 * 数量值模型
 */
export class QuantityValue {
  @ApiProperty({ description: '数量', example: '100' })
  amount: string;

  @ApiProperty({ description: '单位', example: '1' })
  unit: string;
}

/**
 * 日期时间值模型
 */
export class TimeValue {
  @ApiProperty({ description: '时间', example: '+2023-01-01T00:00:00Z' })
  time: string;

  @ApiProperty({ description: '精度', example: 11 })
  precision: number;

  @ApiPropertyOptional({ description: '公历', example: 'http://www.wikidata.org/entity/Q1985727' })
  calendarmodel?: string;
}

/**
 * 数据值模型
 * 可以是多种类型之一
 */
export class DataValue {
  @ApiProperty({ description: '数据类型', example: 'string' })
  type: DataValueType;

  @ApiProperty({ 
    description: '数据值', 
    oneOf: [
      { type: 'string' },
      { type: 'object', $ref: '#/components/schemas/EntityReference' },
      { type: 'object', $ref: '#/components/schemas/QuantityValue' },
      { type: 'object', $ref: '#/components/schemas/TimeValue' }
    ] 
  })
  value: string | EntityReference | QuantityValue | TimeValue;
}

/**
 * 主声明模型
 */
export class MainSnak {
  @ApiProperty({ description: '声明类型', example: 'value', enum: ['value', 'somevalue', 'novalue'] })
  snaktype: SnakType;

  @ApiProperty({ description: '属性ID', example: 'P31' })
  property: string;

  @ApiPropertyOptional({ description: '哈希值', example: '8f7599319c8f07055134a500cf67fc22d1b3142d' })
  hash?: string;

  @ApiProperty({ description: '数据值', type: DataValue })
  datavalue: DataValue;

  @ApiProperty({ description: '数据类型', example: 'wikibase-item' })
  datatype: string;
}

/**
 * 限定词模型
 */
export class Qualifier extends MainSnak {
}

/**
 * 引用模型
 */
export class Reference {
  @ApiProperty({ description: '声明哈希', example: '732ec1c90a6f0694c7db9a92e7818b4494aa3e0c' })
  hash: string;

  @ApiProperty({ description: '声明列表', type: [MainSnak] })
  snaks: MainSnak[];
}

/**
 * 边关系模型
 * 表示两个实体之间的关系
 */
export class Edge {
  @ApiPropertyOptional({ description: '边ID', example: '7890' })
  id?: string;

  @ApiPropertyOptional({ description: '边键', example: '7890' })
  _key?: string;

  @ApiProperty({ description: '来源实体ID', example: 'entity/123' })
  _from: string;

  @ApiProperty({ description: '目标实体ID', example: 'entity/456' })
  _to: string;

  @ApiProperty({ description: '主声明', type: MainSnak })
  mainsnak: MainSnak;

  @ApiPropertyOptional({ description: '限定词列表', type: [Qualifier] })
  qualifiers?: Qualifier[];

  @ApiPropertyOptional({ description: '引用列表', type: [Reference] })
  references?: Reference[];

  @ApiProperty({ description: '类型', example: 'statement' })
  type: string;

  @ApiProperty({ description: '级别', example: 'normal', enum: ['normal', 'preferred', 'deprecated'] })
  rank: RankType;
}

/**
 * 图节点数据结构
 */
export class GraphNodeData {
  @ApiProperty({ description: '节点ID', example: 'entity/123' })
  _id: string;

  @ApiPropertyOptional({ description: '图片列表', type: [String] })
  images?: string[];

  @ApiProperty({ description: '节点类型', example: 'E1' })
  type: string;

  @ApiProperty({ description: '显示ID', example: '123' })
  id: string;

  @ApiPropertyOptional({ description: '基础属性列表', type: [Object] })
  base?: any[];

  @ApiProperty({ description: '节点标签', example: '人工智能' })
  label: string;

  @ApiPropertyOptional({ description: '节点描述', example: '一种计算机科学的分支' })
  description?: string;
}

/**
 * 图结构中的节点
 */
export class GraphNode {
  @ApiProperty({ description: '节点数据', type: GraphNodeData })
  data: GraphNodeData;
}

/**
 * 图边数据结构
 */
export class GraphEdgeData {
  @ApiProperty({ description: '边ID', example: '7890' })
  _id: string;

  @ApiProperty({ description: '来源节点ID', example: '123' })
  source: string;

  @ApiProperty({ description: '目标节点ID', example: '456' })
  target: string;

  @ApiProperty({ description: '边标签', example: '发明者' })
  label: string;
}

/**
 * 图结构中的边
 */
export class GraphEdge {
  @ApiProperty({ description: '边数据', type: GraphEdgeData })
  data: GraphEdgeData;
}

/**
 * 图谱元素
 */
export class GraphElements {
  @ApiProperty({ description: '节点列表', type: [GraphNode] })
  nodes: GraphNode[];

  @ApiProperty({ description: '边列表', type: [GraphEdge] })
  edges: GraphEdge[];
}

/**
 * 知识图谱响应模型
 */
export class KnowledgeGraph {
  @ApiProperty({ description: '图谱元素', type: GraphElements })
  elements: GraphElements;
}
