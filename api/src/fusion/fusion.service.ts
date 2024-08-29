import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';
import { XIdType } from 'src/core';
import { EsService } from 'src/es/es.service';
import { Extraction } from 'src/extraction/extraction.entity';

@Injectable()
export class FusionService {
  constructor(@Inject('ARANGODB') private db: Database, private elasticsearchService: EsService) { }

  async fusion({
    entity,
  }: {
    entity: any;
  }): Promise<any> {
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

    return this.elasticsearchService.bulk({
      body: [
        // 指定的数据库为news, 指定的Id = 1
        { index: { _index: 'entity', } },
        document
      ]
    }).then((doc: any) => {
      const myCollection = this.db.collection('entity');
      entity.items.forEach((item: any) => {
        myCollection
          .document(item.split('/')[1])
          .then((existingDocument) => {
            // Update the document fields
            existingDocument.id = doc['items'][0]['index']['_id'];
            return myCollection.update(existingDocument._key, existingDocument);
          })
          .then(
            (updatedDocument) => console.log('Document updated:', updatedDocument),
            (err) => console.error('Failed to update document:', err),
          );
      })
      return doc['items'][0]['index']
    })
    // for (const extraction of extractions) {
    //   let s = await this.getEntityBylabel(extraction.subject);
    //   if (!s) {
    //     s = {
    //       label: extraction.subject,
    //       description: extraction.subject,
    //     };
    //     s = await this.addOrUpdateEntity(s);
    //   }

    //   const p = await this.getPropertyByName(extraction.property);
    //   console.log(p);

    //   if (p['tail'] == 'wikibase-item') {
    //     let o = await this.getEntityBylabel(extraction.object);
    //     if (!o) {
    //       o = {
    //         label: extraction.object,
    //         description: extraction.object,
    //       };
    //       o = await this.addOrUpdateEntity(o);
    //     }
    //     const link = {
    //       from: s['_id'],
    //       to: o['_id'],
    //       mainsnak: {
    //         snaktype: 'value',
    //         property: p['_key'],
    //         hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
    //         datavalue: {
    //           value: {
    //             'entity-type': 'item',
    //             'numeric-id': Number.parseInt(o['_id'].split('/')[1]),
    //             id: o['_id'],
    //           },
    //           type: 'wikibase-entityid',
    //         },
    //         datatype: p['tail'],
    //       },
    //     };

    //     await this.addOrUpdateLink(link);
    //   } else {
    //     const link = {
    //       from: s['_id'],
    //       to: s['_id'],
    //       value: extraction.object,
    //       mainsnak: {
    //         snaktype: 'value',
    //         property: p['_key'],
    //         hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
    //         datavalue: { value: extraction.object, type: 'string' },
    //         datatype: p['tail'],
    //       },
    //     };
    //     console.log(link);

    //     await this.addOrUpdateLink(link);
    //   }

    //   // if (p) {

    //   // } else {
    //   //   const property = {
    //   //     name: extraction.property,
    //   //     description: extraction.property,
    //   //   };
    //   //   const newProperty = await this.addProperty(property);
    //   //   const link = {
    //   //     from: s['_id'],
    //   //     to: o['_id'],
    //   //     property: newProperty['_key'],
    //   //   };
    //   //   await this.addOrUpdateLink(link);
    //   // }
    // }
  }

  async restore({
    entity,
  }: {
    entity: any;
  }): Promise<any> {
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
            items: [item]
          };

          this.elasticsearchService.bulk({
            body: [
              // 指定的数据库为news, 指定的Id = 1
              { index: { _index: 'entity', _id: existingDocument['_key'] } },
              document
            ]
          });
          existingDocument.id = existingDocument['_key'];
          return myCollection.update(existingDocument._key, existingDocument);
        })
        .then(
          (updatedDocument) => console.log('Document updated:', updatedDocument),
          (err) => console.error('Failed to update document:', err),
        );
    });
  };

  async addOrUpdateEntity(entity) {
    const existingEntity = await this.getEntityBylabel(entity.label);
    if (existingEntity) {
      entity.id = existingEntity['_key'];
      return await this.updateEntity(entity);
    } else {
      return await this.addEntity(entity, 'entity');
    }
  }

  async addOrUpdateLink(link) {
    const existingLink = await this.getLinkByFromAndTo(link);
    console.log(existingLink);
    if (!existingLink) {
      return await this.addLink(link);
    }
  }

  async knowledge(nodes: Array<any>, knowledge: string): Promise<any> {
    console.log(nodes);
    console.log(knowledge);
    const collection = this.db.collection(knowledge + '_entity');
    const edge = this.db.collection(knowledge + '_link');
    console.log(collection);
    console.log(edge);

    for (const node of nodes) {
      try {
        // 执行查询
        const cursor = await this.db.query(aql`FOR v, e, p IN 0..1 OUTBOUND ${node.id[0]
          } GRAPH 'graph'
          INSERT  v INTO ${collection} OPTIONS { overwriteMode: "update", keepNull: true, mergeObjects: false }
          FOR edge IN p['edges']
            LET link = MERGE(edge, {'_from': CONCAT(${knowledge + '_entity/'
          }, SPLIT(edge['_from'], "/")[1]),'_to': CONCAT(${knowledge + '_entity/'
          }, SPLIT(edge['_to'], "/")[1]),})
            INSERT   link INTO ${edge} OPTIONS { overwriteMode: "update", keepNull: true, mergeObjects: false }
          RETURN { "v": v, "e": e, "p":p }`);

        // 获取查询结果
        const result = await cursor.next();
        // 处理查询结果
        return result;
      } catch (error) {
        console.error('Query Error:', error);
      }
    }
  }

  async addEntity(entity: any, collection: string): Promise<any> {
    // 获取集合（Collection）
    console.log(collection);
    const myCollection = this.db.collection(collection);

    // 插入数据
    const document = {
      _key: entity.id,
      id: entity.id,
      labels: { zh: { language: 'zh', value: entity.label } },
      descriptions: { zh: { language: 'zh', value: entity.description } },
      modified: new Date().toISOString(),
    };

    return myCollection.save(document);
  }

  async deleteEntity(id: any): Promise<any> {
    const myCollection = this.db.collection('entity');
    return myCollection.remove(id);
  }

  async updateEntity(entity: any): Promise<any> {
    // Fetch the existing document
    const myCollection = this.db.collection('entity');

    return myCollection.document(entity.id).then((existingDocument) => {
      // Update the document fields
      existingDocument.labels = {
        zh: { language: 'zh', value: entity.label },
      };
      existingDocument.descriptions = {
        zh: { language: 'zh', value: entity.description },
      };
      existingDocument.modified = new Date().toISOString();
      return myCollection.update(existingDocument._key, existingDocument);
    });
  }

  async getEntityBylabel(label: any): Promise<any> {
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

  async addLink(entity: any): Promise<any> {
    // 获取集合（Collection）
    const myCollection = this.db.collection('link');
    const document = {
      _from: entity.from,
      _to: entity.to,
      id: entity.id,
      mainsnak: entity['mainsnak'],
      type: 'statement',
      rank: 'normal',
    };
    return myCollection.save(document);
  }

  async getLinkByFromAndTo(link: any): Promise<any> {
    try {
      // 执行查询
      const cursor = await this.db.query(aql`FOR l IN link
      FILTER l['_from']==${link['from']} AND l['_to']==${link['to']} AND l['mainsnak']['property'] == ${link['mainsnak']['property']} AND l['mainsnak']['datavalue']['value'] == ${link['mainsnak']['datavalue']['value']}
      RETURN l`);
      // 获取查询结果
      const result = await cursor.next();
      // 处理查询结果
      return result;
    } catch (error) {
      console.error('Query Error:', error);
    }
  }

  async addProperty(property: any): Promise<any> {
    // 获取集合（Collection）
    const myCollection = this.db.collection('property');

    // 插入数据
    const document = {
      _key: property.id,
      id: property.id,
      name: property.name,
      enName: null,
      description: property.description,
      enDescription: null,
    };

    return myCollection.save(document);
  }

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
      const start = size * (index - 1);
      let cursor = null;
      console.log(start);
      console.log(size);
      console.log(query.keyword);
      if (query.keyword == '%%') {
        console.log(123);
        console.log(`
        LET langulage = 'zh'
        LET list = (FOR doc IN entity
        FILTER  doc.modified
        SORT doc.modified
        LIMIT ${start}, ${size}
        RETURN {id:TO_ARRAY(doc['_id']), label: TO_ARRAY(doc['labels'][langulage]['value']), description: TO_ARRAY(doc['descriptions'][langulage]['value']), aliases: TO_ARRAY(doc['aliases'][langulage][*]['value'])})
        RETURN {total: COUNT(entity), list: list}
    `);

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
        SEARCH LIKE(doc['labels'][langulage]['value'], ${query.keyword} )
        OR LIKE(doc['descriptions'][langulage]['value'], ${query.keyword})
        OR LIKE(doc['aliases'][langulage]['value'],  ${query.keyword}) RETURN doc)


        LET list = (FOR doc IN entity_view
        SEARCH LIKE(doc['labels'][langulage]['value'], ${query.keyword} )
        OR LIKE(doc['descriptions'][langulage]['value'], ${query.keyword})
        OR LIKE(doc['aliases'][langulage]['value'],  ${query.keyword})
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

  async getPropertyByName(name: any): Promise<any> {
    try {
      // 执行查询
      const cursor = await this.db.query(aql`FOR p IN property
      FILTER p['name'] ==${name}
      RETURN p`);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: any,
  ): Promise<any> {
    try {
    const start = size * (index - 1);
    const end = start + size;
   
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
        console.log(result);
        // 处理查询结果
        return { total: 100, list: result };
      

    })

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
}
