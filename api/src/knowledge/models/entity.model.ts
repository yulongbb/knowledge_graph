import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 语言内容模型
 * 表示某种语言的内容
 */
export class LanguageValue {
  @ApiProperty({ description: '语言代码', example: 'zh-cn' })
  language: string;

  @ApiProperty({ description: '内容值', example: '人工智能' })
  value: string;
}

/**
 * 多语言标签模型
 * 存储不同语言的标签内容
 */
export class MultilingualLabels {
  @ApiProperty({ description: '中文标签', type: LanguageValue })
  zh: LanguageValue;

  @ApiPropertyOptional({ description: '英文标签', type: LanguageValue })
  en?: LanguageValue;
  
  [key: string]: LanguageValue;
}

/**
 * 别名数组模型
 * 存储特定语言的多个别名
 */
export class AliasArray {
  [key: string]: LanguageValue[];
}

/**
 * 实体类型模型
 */
export class EntityType {
  @ApiProperty({ description: '类型ID', example: 'E1' })
  id: string;

  @ApiPropertyOptional({ description: '类型名称', example: '人物' })
  name?: string;

  @ApiPropertyOptional({ description: '类型标签', example: '人物' })
  label?: string;

  @ApiPropertyOptional({ description: '类型描述', example: '人类个体' })
  description?: string;
}

/**
 * 媒体资源模型
 */
export class MediaResource {
  @ApiProperty({ description: '资源ID', example: '1a2b3c4d' })
  id: string;

  @ApiProperty({ description: '资源名称', example: 'profile.jpg' })
  name: string;

  @ApiPropertyOptional({ description: '资源URL', example: 'http://example.com/images/profile.jpg' })
  url?: string;

  @ApiPropertyOptional({ description: '资源类型', example: 'image/jpeg' })
  type?: string;

  @ApiPropertyOptional({ description: '资源描述', example: '个人照片' })
  description?: string;
}

/**
 * 地理位置模型
 */
export class GeoLocation {
  @ApiProperty({ description: '经度', example: 116.397452 })
  longitude: number;

  @ApiProperty({ description: '纬度', example: 39.909187 })
  latitude: number;

  @ApiPropertyOptional({ description: '位置名称', example: '北京市' })
  name?: string;

  @ApiPropertyOptional({ description: '位置描述', example: '中国首都' })
  description?: string;
}

/**
 * 知识实体模型
 * 系统中知识图谱的基本单元
 */
export class Entity {
  @ApiPropertyOptional({ description: '实体ID，创建时自动生成', example: '123456' })
  id?: string;

  @ApiPropertyOptional({ description: '源数据的键', example: 'Q12345' })
  _key?: string;

  @ApiProperty({ description: '实体类型', type: EntityType })
  type: EntityType;

  @ApiProperty({ description: '多语言标签', type: MultilingualLabels })
  labels: MultilingualLabels;

  @ApiProperty({ description: '多语言描述', type: MultilingualLabels })
  descriptions: MultilingualLabels;

  @ApiPropertyOptional({ description: '多语言别名', type: AliasArray })
  aliases?: AliasArray;

  @ApiPropertyOptional({ description: '标签数组', type: [String], example: ['科技', '互联网'] })
  tags?: string[];

  @ApiPropertyOptional({ description: '相关实体ID数组', type: [String] })
  items?: string[];

  @ApiPropertyOptional({ description: '图片资源列表', type: [String] })
  images?: string[];

  @ApiPropertyOptional({ description: '视频资源列表', type: [String] })
  videos?: string[];

  @ApiPropertyOptional({ description: '文档资源列表', type: [String] })
  documents?: string[];

  @ApiPropertyOptional({ description: '信息来源列表', type: [String] })
  sources?: string[];

  @ApiPropertyOptional({ description: '地理位置', type: GeoLocation })
  location?: GeoLocation;

  @ApiPropertyOptional({ description: '模板内容', example: '<div>{{labels.zh.value}}</div>' })
  template?: string;

  @ApiPropertyOptional({ description: '最后修改时间', example: '2023-01-01T12:00:00Z' })
  modified?: string;
  
  // 批量导入用的声明
  @ApiPropertyOptional({ description: '声明/属性关系列表' })
  claims?: Record<string, any[]>;
}

/**
 * 自动提取的实体数据
 */
export class ExtractedEntity {
  @ApiProperty({ description: '实体ID', example: '12345' })
  id: string;

  @ApiProperty({ description: '实体词', example: '人工智能' })
  word: string;
}

/**
 * 包含自动提取实体的完整知识实体
 */
export class EntityWithExtracted extends Entity {
  @ApiPropertyOptional({ description: '自动提取的相关实体', type: [ExtractedEntity] })
  entities?: ExtractedEntity[];
}
