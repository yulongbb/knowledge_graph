// redis.service.ts

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class EsService {


  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  async search(params: any) {
    let data = await this.elasticsearchService.search(params)
    return { total: data['hits']['total']['value'], list: data['hits']['hits'], aggregations: data['aggregations']['types']['buckets'] };
  }

  async bulk(params: any) {
    return await this.elasticsearchService.bulk(params);
  }

  async get(id: any) {
    return await this.elasticsearchService.get({ index: 'entity', id: id });
  }

  async delete(id: any) {
    return await this.elasticsearchService.delete({ index: 'entity', id: id });
  }

  async aggs(params: any) {
    let data = await this.elasticsearchService.search(params)
    return { aggs: data['aggregations'] };
  }
}

