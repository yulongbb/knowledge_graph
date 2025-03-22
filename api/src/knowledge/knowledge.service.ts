import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType } from 'src/core';
import { EsService } from './es.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { Schema } from 'src/ontology/entities/schema.entity';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import * as Handlebars from 'handlebars';

@Injectable()
export class KnowledgeService {
  private readonly redis: Redis;

  constructor(
    @Inject('ARANGODB') private db: Database,
    private elasticsearchService: EsService,
    private propertiesService: PropertiesService,
    private readonly schemasService: SchemasService,
  ) {
    this.redis = new Redis({
      host: 'localhost', // Redis 服务器的主机名
      port: 6379, // Redis 服务器的端口
      password: 'root',
      db: 1,
    });
  }

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
        tags: entity?.tags,
        modified: new Date().toISOString(),
      };
    } else {
      item = {
        type: 'item',
        labels: entity?.labels,
        descriptions: entity?.descriptions,
        aliases: entity?.aliases,
        tags: entity?.tags,
        modified: new Date().toISOString(),
      };
    }

    return document.save(item).then(
      async (doc) => {
        // 插入关系
        // const edge = this.db.collection('link');

        // 插入类型节点
        // const type = {
        //   _key: entity.type.id,
        //   type: 'item',
        //   labels: { zh: { language: 'zh', value: entity.type.label } },
        //   descriptions: {
        //     zh: { language: 'zh', value: entity.type.description },
        //   },
        //   aliases: { zh: [{ language: 'zh', value: entity.type.label }] },
        //   modified: new Date().toISOString(),
        //   id: entity.type.id,
        // };

        if (!entity.type.id) {
          let schema = await this.schemasService.getByName(entity.type);
          if (!schema) {
            const s = new Schema();
            s.id = uuidv4();
            s.name = entity.type;
            s.label = entity.type;
            schema = await this.schemasService.post(s);
          }
          entity.type = { id: schema.id, name: schema.name };
          console.log(entity.type);
        }

        // document.document(entity.type.id).then(
        //   (updatedDocument) => {
        //     edge
        //       .save({
        //         _from: doc['_id'],
        //         _to: updatedDocument['_id'],
        //         id: entity.id,
        //         mainsnak: {
        //           snaktype: 'value',
        //           property: 'P31',
        //           hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
        //           datavalue: {
        //             value: {
        //               'entity-type': 'item',
        //               'numeric-id': Number.parseInt(
        //                 updatedDocument['_key'].replace('Q', ''),
        //               ),
        //               id: type['_key'],
        //             },
        //             type: 'wikibase-entityid',
        //           },
        //           datatype: 'wikibase-item',
        //         },
        //         type: 'statement',
        //         rank: 'normal',
        //       })
        //       .then(
        //         (doc) => console.log('Document saved:', doc),
        //         (err) => console.error('Failed to save document:', err),
        //       );
        //   },
        //   (err) => {
        //     document.save(type).then((t: any) => {
        //       edge
        //         .save({
        //           _from: doc['_id'],
        //           _to: t['_id'],
        //           id: entity.id,
        //           mainsnak: {
        //             snaktype: 'value',
        //             property: 'P31',
        //             hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
        //             datavalue: {
        //               value: {
        //                 'entity-type': 'item',
        //                 'numeric-id': Number.parseInt(
        //                   t['_key'].replace('Q', ''),
        //                 ),
        //                 id: t['_key'],
        //               },
        //               type: 'wikibase-entityid',
        //             },
        //             datatype: 'wikibase-item',
        //           },
        //           type: 'statement',
        //           rank: 'normal',
        //         })
        //         .then(
        //           (doc) => console.log('Document saved:', doc),
        //           (err) => console.error('Failed to save document:', err),
        //         );
        //     });
        //   },
        // );
        const source = {
          type: entity.type.id,
          labels: entity?.labels,
          descriptions: entity?.descriptions,
          aliases: entity?.aliases,
          tags: entity?.tags,
          modified: new Date().toISOString(),
          items: ['entity/' + doc['_key']],
          images: entity?.images,
          videos: entity?.videos,
          location: entity?.location,
          sources: entity?.sources,
          documents: entity?.documents,
        };
        const data = await this.elasticsearchService.bulk(source);

        console.log(JSON.stringify(data));
        document.document(doc['_key']).then((existingDocument) => {
          existingDocument.id = data['items'][0]['index']['_id'];
          document.update(doc['_key'], existingDocument);
        });
        return { ...doc, ...source };
      },
      (err) => console.error('Failed to save document:', err),
    );
  }

  async updateEntity(entity: any): Promise<any> {
    // 1. 获取现有文档
    const existingDoc: any = await this.elasticsearchService.get(entity.id);
    if (!existingDoc) {
      throw new Error('Entity not found');
    }

    // 2. 深度合并现有文档和更新内容
    const mergedDoc = {
      ...existingDoc._source,
      ...entity,
      // 确保某些字段的合并逻辑
      labels: entity.labels || existingDoc._source.labels,
      descriptions: entity.descriptions || existingDoc._source.descriptions,
      aliases: entity.aliases || existingDoc._source.aliases,
      tags: entity.tags || existingDoc._source.tags,
      // 媒体字段合并
      images: entity.images || existingDoc._source.images,
      videos: entity.videos || existingDoc._source.videos,
      documents: entity.documents || existingDoc._source.documents,
      sources: entity.sources || existingDoc._source.sources,
      // 其他字段合并
      location: entity.location || existingDoc._source.location,
      template: entity.template || existingDoc._source.template,
      // 保持原有字段
      items: existingDoc._source.items,
      type: entity.type || existingDoc._source.type,
      // 更新修改时间
      modified: new Date().toISOString(),
    };

    // 3. 更新 Elasticsearch
    await this.elasticsearchService.bulk({
      id: entity.id,
      ...mergedDoc,
    });

    // 4. 如果需要，更新 ArangoDB
    if (entity._key) {
      const myCollection = this.db.collection('entity');
      const arangoDoc = await myCollection.document(entity._key);
      if (arangoDoc) {
        const arangoUpdate = {
          type: 'item',
          modified: mergedDoc.modified,
          labels: mergedDoc.labels,
          descriptions: mergedDoc.descriptions,
          aliases: mergedDoc.aliases,
          tags: mergedDoc.tags,
        };
        await myCollection.update(entity._key, arangoUpdate);
      }
    }

    return {
      success: true,
      message: 'Entity updated successfully',
      data: mergedDoc,
    };
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
            images: entity['_source']['images']?.map(
              (image) => 'http://localhost:9000/kgms/' + image,
            ),
            type: entity['_source']['type'],
            id: result[0]?.start?.id ?? id,
            base: [],
            label:
              result[0]?.start?.labels?.zh?.value ||
              entity['_source']?.labels?.zh?.value,
            description:
              result[0]?.start?.descriptions?.zh?.value ||
              entity['_source']?.descriptions?.zh?.value, // 根据你的字段结构选择合适的label
          },
        });
        addedNodes.add(result[0]?.start?.id);
        await Promise.all(
          result.map(async ({ vertex, edge, from, to }) => {
            // 添加节点
            if (!addedNodes.has(vertex.id)) {
              const data = await this.elasticsearchService.get(vertex.id);
              cytoscapeData.elements.nodes.push({
                data: {
                  _id: vertex['_id'],
                  images: data['_source']['images']?.map(
                    (image) => 'http://localhost:9000/kgms/' + image,
                  ),
                  type: data['_source']['type'],
                  id: vertex.id,
                  base: [],
                  label: vertex.labels?.zh?.value || '', // 确保数据结构的安全性
                  description: vertex.descriptions?.zh?.value || '', // 确保数据结构的安全性
                },
              });
              addedNodes.add(vertex.id);
            }
            // 添加边
            if (edge._from !== edge._to) {
              const property = await this.propertiesService.get(
                edge.mainsnak.property.replace('P', ''),
              );
              if (property?.name) {
                cytoscapeData.elements.edges.push({
                  data: {
                    _id: edge['_key'],
                    source: from.id,
                    target: to.id,
                    label: property.name || '', // 根据你的边数据结构选择合适的label
                  },
                });
              }
            }
            // 添加边
            if (edge._from == edge._to) {
              const property = await this.propertiesService.get(
                edge.mainsnak.property.replace('P', ''),
              );
              if (property?.name) {
                cytoscapeData.elements.nodes.forEach((node: any) => {
                  if (node.data._id == edge._from) {
                    if (
                      node['data']['base'].filter((b: any) => b._id == edge._id)
                        .length == 0
                    ) {
                      node['data']['base'].push({
                        _id: edge._id,
                        value: edge.mainsnak.datavalue.value,
                        label: property.name || '',
                      });
                    }
                  }
                });
              }
            }
          }),
        );
        console.log(cytoscapeData);
        return cytoscapeData;
      });
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

  // 更新 Redis 中的热度数据
  async recordView(knowledge: any): Promise<void> {
    // 增加浏览次数
    const viewsKey = `views:${knowledge.id}`;
    await this.redis.incr(viewsKey);
    await this.redis.expire(viewsKey, 7 * 24 * 60 * 60); // 设置 7 天过期

    // 更新热度排名
    const hotKey = 'hot:knowledge';
    await this.redis.zincrby(hotKey, 1, knowledge.id);
  }

  // 获取热度排名前 10 的知识
  async getHotKnowledge(): Promise<{ id: string; score: number }[]> {
    const hotKey = 'hot:knowledge';

    // 获取前 10 热门知识
    const hotData = await this.redis.zrevrange(hotKey, 0, 9, 'WITHSCORES');
    const result = [];
    for (let i = 0; i < hotData.length; i += 2) {
      const knowledge = await this.elasticsearchService.get(hotData[i]);
      console.log(knowledge);
      // 查询 Elasticsearch 获取知识详情
      if (!knowledge) {
        // 从 Redis 中删除该知识 ID
        await this.redis.zrem(hotKey, hotData[i]);
        return null; // 返回 null，表示知识不存在
      }

      console.log(knowledge);

      result.push({
        id: knowledge,
        score: parseInt(hotData[i + 1], 10),
      });
    }

    return result;
  }

  async renderTemplate(id: string): Promise<any> {
    try {
      const entity: any = await this.elasticsearchService.get(id);

      if (!entity?._source?.template) {
        return {
          success: true,
          content: '',
          message: 'No template defined for this entity',
        };
      }

      const sanitizedTemplate = entity._source.template
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/(<h[1-6])/gi, '\n$1') // 确保标题标签前有换行
        .replace(/(<\/h[1-6]>)/gi, '$1\n') // 确保标题标签后有换行
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (match) => {
          return match
            .replace(/{{/g, '&#123;&#123;')
            .replace(/}}/g, '&#125;&#125;');
        })
        .replace(/(<[^>]+>)\s*{{/g, '$1 {{')
        .replace(/}}\s*(<[^>]+>)/g, '}} $1');

      // 编译模板
      let template;
      try {
        template = Handlebars.compile(sanitizedTemplate, {
          strict: false,
          noEscape: true,
        });
      } catch (compileError) {
        console.error('Template compilation failed:', compileError);
        return {
          success: false,
          error: 'Template compilation failed: ' + compileError.message,
        };
      }

      // 渲染内容
      let content;
      try {
        content = template(entity._source);
      } catch (renderError) {
        console.error('Template rendering failed:', renderError);
        return {
          success: false,
          error: 'Template rendering failed: ' + renderError.message,
        };
      }

      // 添加目录 ID
      let counter = 0;
      const contentWithIds = content.replace(
        /<h([1-6])[^>]*>(.*?)<\/h\1>/gi,
        (match, level, text) => {
          const id = `heading-${++counter}`;
          return `<h${level} id="${id}" class="section-heading">${text}</h${level}>`;
        },
      );

      // 添加样式
      const contentWithStyle = `
        <style>
          img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
          }
          pre {
            background-color: #f6f8fa;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
          }
          code {
            font-family: monospace;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            scroll-margin-top: 70px;
          }
          .section-heading {
            position: relative;
          }
          .section-heading:target {
            color: #0366d6;
          }
        </style>
        ${contentWithIds}
      `;

      return {
        success: true,
        content: contentWithStyle,
      };
    } catch (error) {
      console.error('Template rendering failed:', error);
      return {
        success: false,
        error: 'Template processing failed: ' + error.message,
      };
    }
  }
}
