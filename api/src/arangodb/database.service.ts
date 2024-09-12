import { Injectable, Inject } from '@nestjs/common';
import { Database } from 'arangojs';

@Injectable()
export class DatabaseService {
  private database: Database;

  constructor(@Inject('ARANGODB') private db: Database) {
    this.database = db;
  }

  switchDatabase(databaseName: string) {
    // 动态切换数据库名称
    this.database.database(databaseName);
    console.log(`Switched to database: ${databaseName}`);
  }

  getDatabase(): Database {
    return this.database;
  }
}