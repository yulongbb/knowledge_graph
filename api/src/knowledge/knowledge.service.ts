import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType } from 'src/core';
import { EsService } from './es.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { Schema } from 'src/ontology/entities/schema.entity';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Entity, KnowledgeGraph } from './models';

interface FusionResult {
  _id: string;
  _index: string;
  _primary_term: number;
  _seq_no: number;
  _version: number;
  result: string;
}

interface UpdateEntityResult {
  success: boolean;
  message: string;
  data: Record<string, any>;
}

interface HotKnowledgeItem {
  id: any;
  score: number;
}

@Injectable()
export class KnowledgeService {
  private readonly redis: Redis;

  constructor(
    @Inject('ARANGODB') private db: Database,
    private elasticsearchService: EsService,
    private propertiesService: PropertiesService,
    private readonly schemasService: SchemasService,
    private configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: parseInt(this.configService.get('REDIS_PORT')),
      password: this.configService.get('REDIS_PASSWORD'),
      db: parseInt(this.configService.get('REDIS_DB')),
    });
  }

  async fusion({ entity }: { entity: any }): Promise<FusionResult> {
    console.log(entity);
    // 获取集合（Collection）
    for (const id of entity.ids) {
      await this.elasticsearchService.delete(id.toString());
    }

    // 插入数据
    const document = {
      type: entity.type,
      labels: entity.labels,
      aliases: entity.aliases,
      descriptions: entity.descriptions,
      items: entity.items,
      modified: new Date().toISOString(),
    };

    const result = await this.elasticsearchService.bulk(document);
    const myCollection = this.db.collection('entity');

    for (const item of entity.items) {
      try {
        const existingDocument = await myCollection.document(item.split('/')[1]);
        existingDocument.id = result['items'][0]['index']['_id'];
        await myCollection.update(existingDocument._key, existingDocument);
      } catch (err) {
        console.error('Failed to update document:', err);
      }
    }

    return result['items'][0]['index'];
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

          // Fixed bulk call
          this.elasticsearchService.bulk(document);

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

        const source = {
          type: entity.type.id,
          scenes: entity.scenes,
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
          template: entity?.template,
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

  async updateEntity(entity: Partial<Entity>): Promise<UpdateEntityResult> {
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
      try {
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
      } catch (error) {
        console.error('Failed to update ArangoDB document:', error);
      }
    }

    return {
      success: true,
      message: 'Entity updated successfully',
      data: mergedDoc,
    };
  }

  async deleteEntity(id: any): Promise<any> {
    return this.elasticsearchService.get(id).then(async (data: any) => {
      // 从 Redis 删除相关数据
      const viewsKey = `views:${id}`;
      const hotKey = 'hot:knowledge';
      await this.redis.del(viewsKey);
      await this.redis.zrem(hotKey, id);

      data['_source']['items'].forEach(async (item: any) => {
        console.log(item);
        const removeEdgesQuery = `
            FOR edge IN link
            FILTER edge._from == @item OR edge._to == @item
            REMOVE edge IN link
          `;

        await this.db.query(removeEdgesQuery, { item });
      });

      return this.elasticsearchService.delete(id);
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
  ): Promise<KnowledgeGraph> {
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
      return { elements: { nodes: [], edges: [] } };
    }
  }

  async getAllGraph(
    index: number,
    size: number,
    query: any,
  ): Promise<KnowledgeGraph> {
    try {
      const start = size * (index - 1);

      // First, get all entities from Elasticsearch
      const searchResult = await this.elasticsearchService.search({
        size: size,
        from: start,
        query: query?.bool || { match_all: {} },
      });

      const entities = searchResult.list;
      console.log(`Found ${entities.length} entities`);

      if (entities.length === 0) {
        return { elements: { nodes: [], edges: [] } };
      }

      // Extract all entity items for relationship queries
      const allItems: string[] = [];
      entities.forEach((entity: any) => {
        if (entity._source.items) {
          allItems.push(...entity._source.items);
        }
      });

      console.log(`Total items for relationship query: ${allItems.length}`);

      const cytoscapeData = { elements: { nodes: [], edges: [] } };
      const addedNodes = new Set();

      // Add all entities as nodes first
      for (const entity of entities) {
        const entityId = entity._id;
        if (!addedNodes.has(entityId)) {
          cytoscapeData.elements.nodes.push({
            data: {
              _id: entity._source.items?.[0] || entityId,
              images: entity._source.images?.map(
                (image: string) => 'http://localhost:9000/kgms/' + image,
              ),
              type: entity._source.type,
              id: entityId,
              base: [],
              label: entity._source.labels?.zh?.value || 'Unknown',
              description: entity._source.descriptions?.zh?.value || '',
            },
          });
          addedNodes.add(entityId);
        }
      }

      // Only query relationships if we have items
      if (allItems.length > 0) {
        // Query relationships for all entities
        const cursor = await this.db.query(aql`
          FOR item IN ${allItems}
            LET startNode = DOCUMENT(item)
            FOR v, e, p IN 0..1 ANY DOCUMENT(item)['_id'] GRAPH "graph"
            FILTER e != null AND e.mainsnak.property !='P31'
            RETURN {vertex: v, edge: e, start: startNode, from: DOCUMENT(e._from), to: DOCUMENT(e._to)}
        `);

        const relationshipResults = await cursor.all();
        console.log(`Found ${relationshipResults.length} relationships`);

        // Process relationships and add connected nodes
        await Promise.all(
          relationshipResults.map(async ({ vertex, edge, from, to }) => {
            // Add vertex node if not already added and if vertex has valid id
            if (vertex && vertex.id && !addedNodes.has(vertex.id)) {
              try {
                const data = await this.elasticsearchService.get(vertex.id);
                if (data && data._source) {
                  cytoscapeData.elements.nodes.push({
                    data: {
                      _id: vertex['_id'],
                      images: data['_source']['images']?.map(
                        (image: string) => 'http://localhost:9000/kgms/' + image,
                      ),
                      type: data['_source']['type'],
                      id: vertex.id,
                      base: [],
                      label: vertex.labels?.zh?.value || data['_source']?.labels?.zh?.value || '',
                      description: vertex.descriptions?.zh?.value || data['_source']?.descriptions?.zh?.value || '',
                    },
                  });
                  addedNodes.add(vertex.id);
                }
              } catch (error) {
                console.error(`Error fetching vertex data for ${vertex.id}:`, error);
                // Skip this vertex if we can't fetch its data
              }
            }

            // Add edges only if both source and target exist and are valid
            if (edge && edge._from !== edge._to && from?.id && to?.id) {
              try {
                const property = await this.propertiesService.get(
                  edge.mainsnak.property.replace('P', ''),
                );
                if (property?.name) {
                  // Check if both source and target nodes exist in our graph
                  const sourceExists = addedNodes.has(from.id);
                  const targetExists = addedNodes.has(to.id);
                  
                  if (sourceExists && targetExists) {
                    cytoscapeData.elements.edges.push({
                      data: {
                        _id: edge['_key'],
                        source: from.id,
                        target: to.id,
                        label: property.name || '',
                      },
                    });
                  }
                }
              } catch (error) {
                console.error(`Error processing edge ${edge._key}:`, error);
              }
            }

            // Handle self-referencing edges (base properties)
            if (edge && edge._from === edge._to && from?.id) {
              try {
                const property = await this.propertiesService.get(
                  edge.mainsnak.property.replace('P', ''),
                );
                if (property?.name) {
                  cytoscapeData.elements.nodes.forEach((node: any) => {
                    if (node.data._id === edge._from) {
                      if (!node.data.base.some((b: any) => b._id === edge._id)) {
                        node.data.base.push({
                          _id: edge._id,
                          value: edge.mainsnak.datavalue?.value,
                          label: property.name || '',
                        });
                      }
                    }
                  });
                }
              } catch (error) {
                console.error(`Error processing self-edge ${edge._key}:`, error);
              }
            }
          }),
        );
      }

      console.log(`Generated graph with ${cytoscapeData.elements.nodes.length} nodes and ${cytoscapeData.elements.edges.length} edges`);
      return cytoscapeData;
    } catch (error) {
      console.error('Error in getAllGraph:', error);
      return { elements: { nodes: [], edges: [] } };
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
  async getHotKnowledge(): Promise<HotKnowledgeItem[]> {
    const hotKey = 'hot:knowledge';

    // 获取前 10 热门知识
    const hotData = await this.redis.zrevrange(hotKey, 0, 9, 'WITHSCORES');
    const result: HotKnowledgeItem[] = [];
    for (let i = 0; i < hotData.length; i += 2) {
      const knowledge = await this.elasticsearchService.get(hotData[i]);
      console.log(knowledge);
      // 查询 Elasticsearch 获取知识详情
      if (!knowledge) {
        // 从 Redis 中删除该知识 ID
        await this.redis.zrem(hotKey, hotData[i]);
        continue;
      }

      console.log(knowledge);

      result.push({
        id: knowledge,
        score: parseInt(hotData[i + 1], 10),
      });
    }

    return result;
  }


}
