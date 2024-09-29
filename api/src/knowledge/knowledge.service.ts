import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType } from 'src/core';
import { EsService } from './es.service';
import { PropertiesService } from 'src/ontology/services/properties.service';

@Injectable()
export class KnowledgeService {
  constructor(
    @Inject('ARANGODB') private db: Database,

    private elasticsearchService: EsService,
    private propertiesService: PropertiesService,

  ) { }

  async fusion({ entity }: { entity: any }): Promise<any> {
    console.log(entity);
    // 获取集合（Collection）
    entity.ids.forEach((id: any) => {
      this.elasticsearchService.delete(id.toString());
    });

    // 插入数据
    const document = {
      type: entity.type,
      labels: entity.labels,
      aliases: entity.aliases,
      descriptions: entity.descriptions,
      items: entity.items,
      modified: new Date().toISOString(),
    };

    return this.elasticsearchService
      .bulk({
        body: [
          // 指定的数据库为news, 指定的Id = 1
          { index: { _index: 'entity' } },
          document,
        ],
      })
      .then((doc: any) => {
        const myCollection = this.db.collection('entity');
        entity.items.forEach((item: any) => {
          myCollection
            .document(item.split('/')[1])
            .then((existingDocument) => {
              // Update the document fields
              existingDocument.id = doc['items'][0]['index']['_id'];
              return myCollection.update(
                existingDocument._key,
                existingDocument,
              );
            })
            .then(
              (updatedDocument) =>
                console.log('Document updated:', updatedDocument),
              (err) => console.error('Failed to update document:', err),
            );
        });
        return doc['items'][0]['index'];
      });
  }

  async restore({ entity }: { entity: any }): Promise<any> {
    console.log(entity);
    this.elasticsearchService.delete(entity['_id']);

    const myCollection = this.db.collection('entity');
    entity['_source'].items.forEach((item: any) => {
      myCollection
        .document(item.split('/')[1])
        .then((existingDocument) => {
          const document = {
            type: entity['_source'].type,
            labels: existingDocument.labels,
            descriptions: existingDocument.descriptions,
            aliases: existingDocument.aliases,
            modified: new Date().toISOString(),
            items: [item],
          };
          this.elasticsearchService.bulk({
            body: [
              // 指定的数据库为news, 指定的Id = 1
              { index: { _index: 'entity', _id: existingDocument['_key'] } },
              document,
            ],
          });
          existingDocument.id = existingDocument['_key'];
          return myCollection.update(existingDocument._key, existingDocument);
        })
        .then(
          (updatedDocument) =>
            console.log('Document updated:', updatedDocument),
          (err) => console.error('Failed to update document:', err),
        );
    });
  }

  async addEntity(entity: any): Promise<any> {
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
        });
        console.log(JSON.stringify(data));
        document.document(doc['_key']).then((existingDocument) => {
          existingDocument.id = data['items'][0]['index']['_id'];
          document.update(doc['_key'], existingDocument);
        });
        return doc;
      },
      (err) => console.error('Failed to save document:', err),
    );
  }
  async updateEntity(entity: any): Promise<any> {
    // Fetch the existing document
    await this.elasticsearchService.bulk({
      id: entity.id,
      type: entity?.type?.id,
      tags: entity?.tags,
      labels: entity?.labels,
      descriptions: entity?.descriptions,
      aliases: entity?.aliases,
      modified: new Date().toISOString(),
      items: entity?.items,
      images: entity?.images,
    });
    console.log(entity);

    const myCollection = this.db.collection('entity');
    myCollection.document(entity['_key']).then((existingDocument) => {
      console.log(existingDocument);
      // existingDocument.id = entity['_key'];
      // (existingDocument.type = 'item'),
      //   (existingDocument.labels = entity?.labels);
      // existingDocument.descriptions = entity?.descriptions;
      // existingDocument.modified = new Date().toISOString();
      // return myCollection.update(entity['_key'], existingDocument);
    });
    console.log(myCollection);
    return null;


  }
  async deleteEntity(id: any): Promise<any> {
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

        // // 执行删除节点的查询
        // await this.db.query(removeNodeQuery, { item: item.split('/')[1] });
      });
      this.elasticsearchService.delete(id).then((data: any) => {
        return data;
      });
    });
  }

  async link(
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
      });
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
        const items = entity['_source']['items'];
        console.log(items);
        // 使用AQL查询多个items的关系，并合并结果
        const cursor = await this.db.query(aql`
              FOR item IN ${items}
                LET startNode = DOCUMENT(item)
                FOR v, e, p IN 0..1 ANY DOCUMENT(item)['_id'] GRAPH "graph"
                FILTER e != null AND e.mainsnak.property !='P31'
                SORT e.mainsnak.property
                LIMIT ${start}, ${end}
                RETURN {vertex: v, edge: e, start: startNode, from:  DOCUMENT(e._from), to: DOCUMENT(e._to) }
            `);
        // 获取查询结果
        // 获取查询结果
        const result = await cursor.all();
        console.log(result);
        const cytoscapeData = { elements: { nodes: [], edges: [] } };

        // 用于存储已添加的节点，防止重复
        const addedNodes = new Set();

        console.log(111);
        console.log(result[0]?.start);

        cytoscapeData.elements.nodes.push({
          data: {
            _id: result[0]?.start?.id['_id'] ?? items[0],
            images: entity['_source'].images,
            id: result[0]?.start?.id ?? id,
            base: [],
            label: result[0]?.start?.labels?.zh?.value || entity['_source']?.labels?.zh?.value // 根据你的字段结构选择合适的label

          }
        });
        addedNodes.add(result[0]?.start?.id);
        await Promise.all(result.map(async ({ vertex, edge, start, from, to }) => {


          // 添加节点
          if (!addedNodes.has(vertex.id)) {
            let data = await this.elasticsearchService.get(vertex.id);
            cytoscapeData.elements.nodes.push({
              data: {
                _id: vertex['_id'],
                images: data['_source']['images'],
                id: vertex.id,
                base: [],
                label: vertex.labels?.zh?.value || '', // 确保数据结构的安全性
              }
            });
            addedNodes.add(vertex.id);
          }

          // 添加边
          if (edge._from !== edge._to) {
            const property = await this.propertiesService.get(edge.mainsnak.property.replace('P', ''));
            if (property?.name) {
              cytoscapeData.elements.edges.push({
                data: {
                  _id: edge['_key'],
                  source: from.id,
                  target: to.id,
                  label: property.name || '' // 根据你的边数据结构选择合适的label
                }
              });
            }
          }

          // 添加边
          if (edge._from == edge._to) {
            const property = await this.propertiesService.get(edge.mainsnak.property.replace('P', ''));
            if (property?.name) {
              cytoscapeData.elements.nodes.forEach((node: any) => {
                if (node.data._id == edge._from) {
                 
                  if (node['data']['base'].filter((b: any) => b._id == edge._id).length == 0) {
                    node['data']['base'].push({
                      _id: edge._id, 
                      value: edge.mainsnak.datavalue.value,
                      label: property.name || '' 
                    });

                  }
                }
              });

            }
          }
        }));

        console.log(cytoscapeData);


        return cytoscapeData;

      })
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

}
