import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { NodeService } from 'src/knowledge/node.service';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { KnowledgeService } from './knowledge.service';
import { Edge, EntityReference, MainSnak } from './models';

/**
 * Extended data value that guarantees a label property
 */
export interface DataValueWithLabel {
  type: string;
  value: {
    label: string;
    id?: string;
    [key: string]: any;
  };
}

/**
 * Extended edge type that allows working with labels
 * This extends the standard Edge type by making datavalue.value have a guaranteed label property
 */
export interface ExtendedEdge extends Omit<Edge, 'mainsnak'> {
  mainsnak: Omit<MainSnak, 'datavalue'> & {
    datavalue: DataValueWithLabel;
    snaktype: string;
    property: string;
    datatype: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface LinkQueryResult {
  total: number;
  list: Array<{
    id: string;
    from: any;
    to: any;
    property: string;
    value: any;
  }>;
}

interface PropertyInfo {
  id: number;
  name: string;
  description: string;
  enName?: string;
  enDescription?: string;
}

@Injectable()
export class EdgeService {
  constructor(
    @Inject('ARANGODB') private db: Database,
    private readonly nodeService: NodeService,
    private readonly knowledgeService: KnowledgeService,
    public readonly schemasService: SchemasService
  ) {}

  /**
   * Adds a relationship edge between entities
   * Accepts either Edge or ExtendedEdge types for flexibility
   */
  async addEdge(edge: Edge | ExtendedEdge): Promise<Edge> {
    const myCollection = this.db.collection('link');
    if (edge['_to']) {
      // Use unknown as intermediate type for safe type casting
      return (await myCollection.save(edge)) as unknown as Edge;
    }
    
    // Cast to ExtendedEdge to work with label property safely
    const extEdge = edge as ExtendedEdge;
    
    if (extEdge.mainsnak.datatype == 'wikibase-item') {
      // 查询知识并关联
      let data = await this.nodeService.getNodeBylabel(extEdge.mainsnak.datavalue.value.label);
      console.log(data);
      if (data) {
        extEdge['_to'] = data['_id'];
        extEdge.mainsnak.datavalue.value.id = data['_key'];
        return (await myCollection.save(extEdge)) as unknown as Edge;
      } else {
        let query: any = {
          filter: [{
            field: 'id',
            value: Number.parseInt(extEdge.mainsnak.property.replace('P', '')),
            relation: 'values',
            operation: '=',
          }]
        };
        let schema = await this.schemasService.getList(1, 10, query);
        if (schema.list.length > 0) {
          // 新增知识并关联
          let e = await this.knowledgeService.addEntity({ 
            'type': { 'id': schema.list[0].id }, 
            'labels': { 
              'zh': { 'language': 'zh-cn', 'value': extEdge.mainsnak.datavalue.value.label } 
            }, 
            'descriptions': { 
              'zh': { 'language': 'zh-cn', 'value': extEdge.mainsnak.datavalue.value.label } 
            } 
          });
          extEdge['_to'] = e['_id']
          extEdge.mainsnak.datavalue.value.id = e['_key'];
          return (await myCollection.save(extEdge)) as unknown as Edge;
        } else {
          // 新增知识并关联
          let e = await this.knowledgeService.addEntity({ 
            'type': { 'id': 'E4' }, 
            'labels': { 
              'zh': { 'language': 'zh-cn', 'value': extEdge.mainsnak.datavalue.value.label } 
            }, 
            'descriptions': { 
              'zh': { 'language': 'zh-cn', 'value': extEdge.mainsnak.datavalue.value.label } 
            } 
          });
          extEdge['_to'] = e['_id']
          extEdge.mainsnak.datavalue.value.id = e['_key'];
          return (await myCollection.save(extEdge)) as unknown as Edge;
        }
      }
    } else {
      console.log(edge)
      edge['_to'] = edge['_from'];
      return (await myCollection.save(edge)) as unknown as Edge;
    }
  }

  /**
   * Updates an existing relationship edge
   */
  async updateEdge(edge: Edge | ExtendedEdge): Promise<Edge> {
    // Fetch the existing document
    const myCollection = this.db.collection('link');
    const existingDocument = await myCollection.document(edge['_key']);
    
    // Update the document fields
    existingDocument.mainsnak = edge.mainsnak;
    return (await myCollection.update(edge['_key'], existingDocument)) as unknown as Edge;
  }

  async getLinks(index: number, size: number, query: any): Promise<LinkQueryResult> {
    try {
      const start = size * (index - 1);
      console.log(query.toString());
      // 执行查询
      const cursor = await this.db.query(aql`
        LET total = COUNT(FOR doc IN link
          RETURN doc)
        LET list = (FOR edge IN link
          LIMIT ${start}, ${size} 
          RETURN {
            id: edge['_key'], 
            from: Document(edge['_from']), 
            to: Document(edge['_to']), 
            property: edge['mainsnak']['property'], 
            value: edge['mainsnak']['datavalue']['value']
          })
        RETURN {total: total, list: list}
      `);
      // 获取查询结果
      const result = await cursor.all();
      // 处理查询结果
      return result[0];
    } catch (error) {
      console.error('Query Error:', error);
      return { total: 0, list: [] };
    }
  }

  async getProperties(index: number, size: number): Promise<PropertyInfo[]> {
    try {
      const start = size * (index - 1);
      const end = start + size;

      // 执行查询
      const cursor = await this.db.query(aql`
        FOR e IN entity_view
        SEARCH STARTS_WITH(e['_key'], 'P')
        SORT +SUBSTRING(e['_key'], 1)
        LIMIT ${start}, ${end}
        RETURN {
          id: +SUBSTRING(e['_key'], 1), 
          name: e['labels']['zh-cn']['value'], 
          description: e['descriptions']['zh-cn']['value'], 
          enName: e['labels']['en']['value'], 
          enDescription: e['descriptions']['en']['value']
        }`);
      // 获取查询结果
      const result = await cursor.all();
      // 处理查询结果
      return result;
    } catch (error) {
      console.error('Query Error:', error);
      return [];
    }
  }

  async deleteEdge(id: string): Promise<void> {
    const myCollection = this.db.collection('link');
    return myCollection.remove(id).then(
      () => console.log('Document removed successfully'),
      (err) => console.error('Failed to remove document:', err),
    );
  }
}
