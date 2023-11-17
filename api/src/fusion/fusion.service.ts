import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType, XQuery } from 'src/core';

@Injectable()
export class FusionService {
  constructor(@Inject('ARANGODB') private db: Database) {}

  async getEntityList(
    index: number,
    size: number,
    query: any,
    db: string,
  ): Promise<any> {
    this.db = new Database({
      url: 'http://localhost:8529',
      databaseName: db,
      auth: { username: 'root', password: 'root' },
    });
    try {
      // 执行查询
      let start = size * (index - 1);
      let cursor = null;
      console.log(start);
      console.log(size);
      if (query.keyword == '%%') {
        cursor = await this.db.query(aql`
        LET langulage = 'zh'
        LET list = (FOR doc IN entity
        FILTER  doc.modified
        SORT doc.modified
        LIMIT ${start}, ${size}
        RETURN {id:TO_ARRAY(doc['_id']), label: TO_ARRAY(doc['labels'][langulage]['value']), description: TO_ARRAY(doc['descriptions'][langulage]['value']), aliases: TO_ARRAY(doc['aliases'][langulage][*]['value'])})
        RETURN {total: COUNT(entity), list: list}
    `);
      } else {
        cursor = await this.db.query(aql`


        let langulage = 'zh'

        LET total = COUNT(FOR doc IN entity_view
        SEARCH LIKE(doc['labels'][langulage]['value'], TOKENS(${query.keyword}, "en")[0] )
        OR LIKE(doc['descriptions'][langulage]['value'], TOKENS(${query.keyword}, "en")[0])
        OR LIKE(doc['aliases'][langulage]['value'],  TOKENS(${query.keyword}, "en")[0]) RETURN doc)


        LET list = (FOR doc IN entity_view
        SEARCH LIKE(doc['labels'][langulage]['value'], TOKENS(${query.keyword}, "en")[0] )
        OR LIKE(doc['descriptions'][langulage]['value'], TOKENS(${query.keyword}, "en")[0])
        OR LIKE(doc['aliases'][langulage]['value'],  TOKENS(${query.keyword}, "en")[0])
        LIMIT ${start}, ${size}
        RETURN {id:TO_ARRAY(doc['_id']), label: TO_ARRAY(doc['labels'][langulage]['value']), description: TO_ARRAY(doc['descriptions'][langulage]['value']), aliases: TO_ARRAY(doc['aliases'][langulage][*]['value'])})

        RETURN {total: total, list: list}
    `);
      }

      // 获取查询结果
      const result = await cursor.all();
      // 处理查询结果
      return result[0];
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

  async getEntity(id: XIdType): Promise<any> {
    try {
      // 执行查询
      const cursor = await this.db.query(aql`FOR e IN entity
      FILTER e['_key']==${id}
      RETURN e`);
      // 获取查询结果
      const result = await cursor.next();
      // 处理查询结果
      return result;
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

  async getLinks(
    id: XIdType,
    index: number,
    size: number,
    query: any,
  ): Promise<any> {
    try {
      let start = size * (index - 1);
      let end = start + size;

      // 执行查询
      const cursor = await this.db.query(aql`FOR v, e, p IN 0..1 OUTBOUND ${
        'entity/' + id
      } GRAPH "graph"
      FILTER e!=null
      SORT e.mainsnak.property
      LIMIT ${start}, ${end}
      RETURN e['mainsnak']['datavalue']['type']=='wikibase-entityid'?MERGE(

 e, {mainsnak:{snaktype: e['mainsnak']['snaktype'],datavalue:{value:{'entity-type':"item",'numeric-id':e['mainsnak']['datavalue']["value"]['numeric-id'],id:DOCUMENT(CONCAT('entity/',e['mainsnak']['datavalue']["value"]["id"]))["labels"]["zh"]?DOCUMENT(CONCAT('entity/',e['mainsnak']['datavalue']["value"]["id"]))["labels"]["zh"]['value']:DOCUMENT(CONCAT('entity/',e['mainsnak']['datavalue']["value"]["id"]))["labels"]["en"]['value']},type:"wikibase-entityid"},datatype: e['mainsnak']['datatype'], property: DOCUMENT(CONCAT('entity/',e.mainsnak.property))["labels"]["zh"]?DOCUMENT(CONCAT('entity/',e.mainsnak.property))["labels"]["zh"]["value"]:DOCUMENT(CONCAT('entity/',e.mainsnak.property))["labels"]["en"]["value"]}}
):MERGE(

 e, {mainsnak:{snaktype: e['mainsnak']['snaktype'],datavalue: e['mainsnak']['datavalue'],datatype: e['mainsnak']['datatype'], property: DOCUMENT(CONCAT('entity/',e.mainsnak.property))["labels"]["zh"]["value"]?DOCUMENT(CONCAT('entity/',e.mainsnak.property))["labels"]["zh"]["value"]:DOCUMENT(CONCAT('entity/',e.mainsnak.property))["labels"]["en"]["value"]}}
)`);
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
