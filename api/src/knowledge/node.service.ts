import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType } from 'src/core';
import { EsService } from './es.service';

@Injectable()
export class NodeService {

  constructor(
    @Inject('ARANGODB') private db: Database,

    private elasticsearchService: EsService,
  ) {
  }


  async addNode(entity: any): Promise<any> {
    // 获取集合（Collection）
    const document = this.db.collection('entity');

    // 插入数据

    let item = {};

    if (entity['_key']) {
      item = {
        _key: entity['_key'],
        type: 'item',
        labels: entity?.labels,
        descriptions: entity?.descriptions,
        aliases: entity?.aliases,
        modified: new Date().toISOString(),
      };
    } else {
      item = {
        type: 'item',
        labels: entity?.labels,
        descriptions: entity?.descriptions,
        aliases: entity?.aliases,
        modified: new Date().toISOString(),
      };
    }

    return document.save(item).then(
      async (doc) => {
        // 插入关系
        const edge = this.db.collection('link');

        // 插入类型节点
        const type = {
          _key: entity.type.id,
          type: 'item',
          labels: { zh: { language: 'zh', value: entity.type.label } },
          descriptions: {
            zh: { language: 'zh', value: entity.type.description },
          },
          aliases: { zh: [{ language: 'zh', value: entity.type.label }] },
          modified: new Date().toISOString(),
          id: entity.type.id,
        };

        document.document(entity.type.id).then(
          (updatedDocument) => {
            edge
              .save({
                _from: doc['_id'],
                _to: updatedDocument['_id'],
                id: entity.id,
                mainsnak: {
                  snaktype: 'value',
                  property: 'P31',
                  hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
                  datavalue: {
                    value: {
                      'entity-type': 'item',
                      'numeric-id': Number.parseInt(
                        updatedDocument['_key'].replace('Q', ''),
                      ),
                      id: type['_key'],
                    },
                    type: 'wikibase-entityid',
                  },
                  datatype: 'wikibase-item',
                },
                type: 'statement',
                rank: 'normal',
              })
              .then(
                (doc) => console.log('Document saved:', doc),
                (err) => console.error('Failed to save document:', err),
              );
          },
          (err) => {
            document.save(type).then((t: any) => {
              edge
                .save({
                  _from: doc['_id'],
                  _to: t['_id'],
                  id: entity.id,
                  mainsnak: {
                    snaktype: 'value',
                    property: 'P31',
                    hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
                    datavalue: {
                      value: {
                        'entity-type': 'item',
                        'numeric-id': Number.parseInt(
                          t['_key'].replace('Q', ''),
                        ),
                        id: t['_key'],
                      },
                      type: 'wikibase-entityid',
                    },
                    datatype: 'wikibase-item',
                  },
                  type: 'statement',
                  rank: 'normal',
                })
                .then(
                  (doc) => console.log('Document saved:', doc),
                  (err) => console.error('Failed to save document:', err),
                );
            });
          },
        );

        let data = await this.elasticsearchService.bulk({
          type: entity.type.id,
          labels: entity?.labels,
          descriptions: entity?.descriptions,
          aliases: entity?.aliases,
          modified: new Date().toISOString(),
          items: ['entity/' + doc['_key']],
          images: entity?.images,
        },);
        console.log(555)
        console.log(data)
        document.document(doc['_key']).then((existingDocument) => {
          existingDocument.id = data['items'][0]['index']['_id'];
          document.update(doc['_key'], existingDocument);
        });
        return data;
      },
      (err) => console.error('Failed to save document:', err),
    );
  }


  async deleteNode(id: any): Promise<any> {
    console.log(id);
    // const myCollection = this.db.collection('entity');

    // myCollection.remove(id).then(
    //   () => console.log('Document removed successfully'),
    //   (err) => console.error('Failed to remove document:', err),
    // );

    return this.elasticsearchService.get(id).then((data: any) => {
      data['_source']['items'].forEach(async (item: any) => {
        console.log(item);
        const removeEdgesQuery = `
          FOR edge IN link
          FILTER edge._from == @item OR edge._to == @item
          REMOVE edge IN link
        `;

        // 删除节点本身
        const removeNodeQuery = `
          REMOVE { _key: @item } IN entity
        `;

        // 执行删除边的查询
        await this.db.query(removeEdgesQuery, { item });

        // 执行删除节点的查询
        await this.db.query(removeNodeQuery, { item: item.split('/')[1] });
      });
      this.elasticsearchService.delete(id).then((data: any) => {
        console.log(data);
        return data;
      });
    });
  }
  async updateNode(entity: any): Promise<any> {
    // Fetch the existing document
    this.elasticsearchService
      .bulk({
        type: entity?.type?.id,
        labels: entity?.labels,
        descriptions: entity?.descriptions,
        aliases: entity?.aliases,
        modified: new Date().toISOString(),
        items: entity?.items,
        images: entity?.images,
      })
      .then(() => {
        const myCollection = this.db.collection('entity');
        return myCollection
          .document(entity['_key'])
          .then((existingDocument) => {
            // Update the document fields
            existingDocument.id = entity['_key'];
            (existingDocument.type = 'item'),
              (existingDocument.labels = entity?.labels);
            existingDocument.descriptions = entity?.descriptions;
            existingDocument.modified = new Date().toISOString();
            return myCollection.update(entity['_key'], existingDocument);
          });
      });
    (err) => console.error('Failed to save document:', err);
  }
  async getNodeList(index: number, size: number, query: any): Promise<any> {

    try {
      // 执行查询
      const start = size * (index - 1);
      let cursor = null;
      const collection = this.db.collection(query.collection);
      if (query.keyword == '%%') {
        cursor = await this.db.query(aql`
          LET langulage = 'zh'
          LET list = (FOR doc IN  entity
          LIMIT ${start}, ${size}
          RETURN doc)
          RETURN {total: COUNT(${collection}), list: list}
      `);
      } else {
        cursor = await this.db.query(aql`
          let langulage = 'zh'
          LET total = COUNT(FOR doc IN entity_view
          SEARCH LIKE(doc['labels'][langulage]['value'], ${query.keyword} )
          OR LIKE(doc['descriptions'][langulage]['value'], ${query.keyword})
          OR LIKE(doc['aliases'][langulage]['value'],  ${query.keyword}) RETURN doc)
          LET list = (FOR doc IN entity_view
          SEARCH LIKE(doc['labels'][langulage]['value'], ${query.keyword} )
          OR LIKE(doc['descriptions'][langulage]['value'], ${query.keyword})
          OR LIKE(doc['aliases'][langulage]['value'],  ${query.keyword})
          LIMIT ${start}, ${size}
          RETURN {id:TO_ARRAY(doc['_key']), type:doc['type'], label: doc['labels'], description: doc['descriptions'], aliases: doc['aliases']})
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

  async getNode(id: XIdType): Promise<any> {
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

  async getNodeBylabel(label: string): Promise<any> {
    try {
      // 执行查询
      const cursor = await this.db.query(aql`FOR e IN entity
      FILTER e['labels']['zh']['value']==${label}
      RETURN e`);
      // 获取查询结果
      const result = await cursor.next();
      // 处理查询结果
      return result;
    } catch (error) {
      console.error('Query Error:', error);
    }
  }
  async graph(
    id: XIdType,
    index: number,
    size: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: any,
  ): Promise<any> {
    try {
      const start = size * (index - 1);
      const end = start + size;
      console.log(id);
      return this.elasticsearchService.get(id).then(async (entity: any) => {
        console.log(entity['_source']['items']) // [ 'entity/bdi20191862', 'entity/Q6166482' ]
        const items = entity['_source']['items'];
        // 使用AQL查询多个items的关系，并合并结果
        const cursor = await this.db.query(aql`
            FOR item IN ${items}
              FOR v, e, p IN 0..1 OUTBOUND DOCUMENT(item)['_id'] GRAPH "graph"
              FILTER e != null
              SORT e.mainsnak.property
              LIMIT ${start}, ${end}
              RETURN p
          `);
        // 获取查询结果
        const result = await cursor.all();
        console.log(111);
        console.log(result);
        // 处理查询结果
        return { total: 100, list: result };
      })
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

 
}
