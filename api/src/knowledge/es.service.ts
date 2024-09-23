// redis.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as fs from 'fs';

@Injectable()
export class EsService {


  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @Inject('DEFAULT_INDEX') private readonly defaultIndex: string,  // 注入默认索引

  ) { }

  async search(params: any) {
    let data = await this.elasticsearchService.search({
      index: this.defaultIndex, body: params})
    return { total: data['hits']['total']['value'], list: data['hits']['hits'], types: data['aggregations']['types']['buckets'],tags: data['aggregations']['tags']['buckets'] };
  }

  async bulk(doc: any) {
    return await this.elasticsearchService.bulk({
      body: [
        // 指定的数据库为news, 指定的Id = 1
        { index: { _index: this.defaultIndex, _id: doc.id } },
        doc
      ]
    });
  }

  async get(id: any) {
    return await this.elasticsearchService.get({ index: this.defaultIndex, id: id });
  }

  async delete(id: any) {
    return await this.elasticsearchService.delete({ index: this.defaultIndex, id: id });
  }

  async aggs(params: any) {
    let data = await this.elasticsearchService.search(params)
    return { aggs: data['aggregations'] };
  }

  async syncDataToTxt() {
    const  body :any = await this.elasticsearchService.search({
      index: 'entity',  // 替换为你的索引名称
      _source: ['id', 'labels'],
      size: 10000, // 根据需要调整
    });

    console.log(body)

    // 格式化数据
    const data = body.hits.hits
      .map(hit => `${hit._id}, ${hit._source.labels.zh.value}`)
      .join('\n');

    // 将数据写入文件
    fs.writeFileSync('output.txt', data, 'utf8');
    console.log('数据已同步到 output.txt');
    return 
  }
}


