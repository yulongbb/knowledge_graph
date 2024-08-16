// redis.service.ts

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class EsService {
 

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(params: any) {
    return await this.elasticsearchService.search(params);
  }

  async bulk(params: any) {
    return await this.elasticsearchService.bulk(params);
  }
}

