// redis.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as fs from 'fs';
import { Entity, SearchHit, SearchQuery, SearchResponse, ElasticsearchSource } from './models';

/**
 * Elasticsearch服务
 * 提供ES的基础操作，包括搜索、查询、更新、批量操作等
 */
@Injectable()
export class EsService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @Inject('DEFAULT_INDEX') private readonly defaultIndex: string, // 注入默认索引
  ) {}

  /**
   * 搜索知识实体
   * @param params 搜索参数
   * @returns 搜索结果，包含总数、列表和聚合信息
   */
  async search(params: Record<string, any>): Promise<SearchResponse> {
    const data = await this.elasticsearchService.search({
      index: this.defaultIndex,
      body: {
        ...params,
        sort: [{ modified: { order: 'desc' } }]
      },
    });
    
    // 确保每个命中项都符合 SearchHit 接口要求
    const hits = data.hits.hits.map(hit => ({
      _id: hit._id || '',  // 确保 _id 存在
      _score: hit._score,
      _source: hit._source,
      highlight: hit.highlight
    })) as SearchHit[];
    
    // 转换为我们定义的响应格式
    const response: SearchResponse = {
      total: data['hits']['total']['value'],
      list: hits,
      types: data['aggregations']?.['types']?.['buckets'],
      tags: data['aggregations']?.['tags']?.['buckets'],
    };
    
    return response;
  }

  /**
   * 执行查询并返回第一个结果
   * @param params 查询参数
   * @returns 查询结果
   */
  async query(params: Record<string, any>): Promise<SearchHit<ElasticsearchSource> | null> {
    const data = await this.elasticsearchService.search({
      index: this.defaultIndex,
      body: params,
    });
    
    if (data.hits.hits.length === 0) {
      return null;
    }
    
    // Convert to the correct type
    const hit = data.hits.hits[0];
    return {
      _id: hit._id,
      _score: hit._score,
      _source: hit._source,
      highlight: hit.highlight
    };
  }

  /**
   * 更新文档
   * @param id 文档ID
   * @param doc 更新的字段
   * @returns 更新结果
   */
  async update(id: string, doc: Partial<Entity>): Promise<any> {
    return await this.elasticsearchService.update({
      index: this.defaultIndex,
      id: id,
      body: {
        doc: doc, // 更新的字段和值
      },
    });
  }

  /**
   * 批量操作
   * @param doc 文档数据
   * @returns 批量操作结果
   */
  async bulk(doc: Partial<Entity>): Promise<any> {
    return await this.elasticsearchService.bulk({
      body: [
        // 指定索引和ID
        { index: { _index: this.defaultIndex, _id: doc.id } },
        doc,
      ],
    });
  }

  /**
   * 获取文档
   * @param id 文档ID
   * @returns 文档数据
   */
  async get(id: string): Promise<any> {
    return await this.elasticsearchService.get({
      index: this.defaultIndex,
      id: id,
    });
  }

  /**
   * 删除文档
   * @param id 文档ID
   * @returns 删除结果
   */
  async delete(id: string): Promise<any> {
    return await this.elasticsearchService.delete({
      index: this.defaultIndex,
      id: id,
    });
  }

  /**
   * 执行聚合查询
   * @param params 聚合参数
   * @returns 聚合结果
   */
  async aggs(params: Record<string, any>): Promise<{ aggs: any }> {
    const data = await this.elasticsearchService.search(params);
    return { aggs: data['aggregations'] };
  }

  /**
   * 同步ES数据到文本文件
   * 用于生成NLP训练数据
   * @returns 同步结果
   */
  async syncDataToTxt() {
    const body: any = await this.elasticsearchService.search({
      index: 'entity', // 索引名称
      _source: ['id', 'labels'],
      size: 10000, // 数据量上限
    });

    console.log(body);

    // 格式化数据：ID和中文标签
    const data = body.hits.hits
      .map((hit) => `${hit._id}, ${hit._source.labels.zh.value}`)
      .join('\n');

    // 将数据写入文件
    fs.writeFileSync('output.txt', data, 'utf8');
    console.log('数据已同步到 output.txt');
    return { success: true, message: '数据已同步到output.txt文件' };
  }
}
