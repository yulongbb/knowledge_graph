import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType } from 'src/core';

@Injectable()
export class EdgeService {
  constructor(@Inject('ARANGODB') private db: Database) { }

  async getLinks(
    index: number,
    size: number,
    query: any,
  ): Promise<any> {
    try {
      let start = size * (index - 1);
      let end = start + size;
      console.log(query.toString());

      // 执行查询
      const cursor = await this.db.query(aql`FOR edge IN link
      LIMIT ${start}, ${end}
      RETURN {from: Document(edge['_from']), to: Document(edge['_to']), property: edge['mainsnak']['property']}
     
      `);
      // 获取查询结果
      const result = await cursor.all();
      // 处理查询结果
      return { total: 100, list: result };
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

  async getProperties(index: number, size: number): Promise<any> {
    try {
      let start = size * (index - 1);
      let end = start + size;

      // 执行查询
      const cursor = await this.db.query(aql`FOR e IN entity_view
      SEARCH STARTS_WITH(e['_key'], 'P')
      SORT +SUBSTRING(e['_key'], 1)
      LIMIT ${start}, ${end}
      RETURN {id: +SUBSTRING(e['_key'], 1), name: e['labels']['zh-cn']['value'], description: e['descriptions']['zh-cn']['value'], enName: e['labels']['en']['value'], enDescription: e['descriptions']['en']['value']}`);
      // 获取查询结果
      const result = await cursor.all();
      // 处理查询结果
      return result;
    } catch (error) {
      console.error('Query Error:', error);
    }
  }
}
