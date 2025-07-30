import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'arangojs';

@Injectable()
export class ArangoDBInitService {
  private readonly logger = new Logger(ArangoDBInitService.name);
  private db: Database;

  constructor(private readonly configService: ConfigService) {
    this.db = new Database({
      url: this.configService.get<string>('ARANGODB_URL') || 'http://localhost:8529',
    });
    this.db.useBasicAuth(
      this.configService.get<string>('ARANGODB_USER') || 'root',
      this.configService.get<string>('ARANGODB_PASSWORD') || ''
    );
  }

  async initArango() {
    const dbName = 'kgms';
    try {
      // 创建数据库
      const dbs = await this.db.listDatabases();
      if (!dbs.includes(dbName)) {
        await this.db.createDatabase(dbName);
        this.logger.log(`ArangoDB数据库 ${dbName} 创建成功`);
      } else {
        this.logger.log(`ArangoDB数据库 ${dbName} 已存在`);
      }
      // 切换到目标数据库
      const db = this.db.database(dbName);

      // 创建集合 entity
      const entityCollection = db.collection('entity');
      if (!(await entityCollection.exists())) {
        await entityCollection.create();
        this.logger.log('ArangoDB集合 entity 创建成功');
      }

      // 创建边集合 link（用 collection 创建，type 指定为 edge）
      const linkCollection = db.collection('link');
      if (!(await linkCollection.exists())) {
        await linkCollection.create({ type: 3 }); // 3 表示 edge collection
        this.logger.log('ArangoDB边集合 link 创建成功');
      }

      // 创建图 graph
      const graph = db.graph('graph');
      const graphExists = await graph.exists();
      if (!graphExists) {
        await graph.create([
          {
            collection: 'link',
            from: ['entity'],
            to: ['entity'],
          },
        ]);
        this.logger.log('ArangoDB图 graph 创建成功');
      } else {
        this.logger.log('ArangoDB图 graph 已存在');
      }

      // 创建 entity_view 视图（ArangoSearch），支持 labels.zh.value、descriptions.zh.value、aliases[*].zh.value 检索和 modified 排序
      const view = db.view('entity_view');
      const viewExists = await view.exists();
      if (!viewExists) {
        await view.create({
          type: 'arangosearch',
          links: {
            entity: {
              analyzers: ['text_zh'],
              fields: {
                'labels.zh.value': { analyzers: ['text_zh'] },
                'descriptions.zh.value': { analyzers: ['text_zh'] },
                'aliases.*.zh.value': { analyzers: ['text_zh'] },
                'modified': { analyzers: ['identity'] }
              },
              includeAllFields: false,
              storeValues: 'none'
            }
          }
        });
        this.logger.log('ArangoDB视图 entity_view 创建成功');
      } else {
        this.logger.log('ArangoDB视图 entity_view 已存在');
      }
    } catch (error) {
      this.logger.error('ArangoDB初始化失败', error);
    }
  }
}
