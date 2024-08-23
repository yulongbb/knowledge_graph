import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { NodeService } from 'src/node/node.service';

@Injectable()
export class EdgeService {


  constructor(@Inject('ARANGODB') private db: Database, private readonly nodeService: NodeService,) { }


  async addEdge(edge: any): Promise<any> {
    const myCollection = this.db.collection('link');
    let result = null;
    if (!edge['_to']) {
      // 新增知识
      this.nodeService.addEntity({ 'type': { 'id': 'E4' }, 'labels': { 'zh': { 'language': 'zh-cn', 'value': edge.mainsnak.datavalue.value.value } } }).then((entity:any)=>{
        console.log(entity)
        console.log(entity.items[0].index._id)
        edge.mainsnak.datavalue.value.value = entity.items[0].index._id;
        edge['_to'] = 'entity/'+entity.items[0].index._id;
        console.log(edge)
        result = myCollection.save(edge).then(
          () => console.log('Document removed successfully'),
          (err) => console.error('Failed to remove document:', err),
        )
      })
  
    }
    console.log(edge)
    return result;
  }

  updateEdge(edge: any): Promise<any> {
    // Fetch the existing document
    const myCollection = this.db.collection('link');

    return myCollection
      .document(edge['_key'])
      .then((existingDocument) => {
        // Update the document fields
        existingDocument.mainsnak = edge.mainsnak;
        return myCollection.update(edge['_key'], existingDocument);
      })
  }

  async getLinks(index: number, size: number, query: any): Promise<any> {
    try {
      const start = size * (index - 1);
      console.log(query.toString());

      // 执行查询
      const cursor = await this.db.query(aql`
      
      LET total = COUNT(FOR doc IN link
        RETURN doc)
        
  LET list = (FOR edge IN link
    LIMIT ${start}, ${size} 
           RETURN {id: edge['_key'], from: Document(edge['_from']), to: Document(edge['_to']), property: Document('property',edge['mainsnak']['property']), value:edge['mainsnak']['datavalue']['value'] })
        
  RETURN {total: total, list: list}
      `);



      // 获取查询结果
      const result = await cursor.all();
      // 处理查询结果
      return result[0];
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

  async getProperties(index: number, size: number): Promise<any> {
    try {
      const start = size * (index - 1);
      const end = start + size;

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

  async deleteEdge(id: any): Promise<any> {
    const myCollection = this.db.collection('link');
    return myCollection.remove(id).then(
      () => console.log('Document removed successfully'),
      (err) => console.error('Failed to remove document:', err),
    );
  }
}
