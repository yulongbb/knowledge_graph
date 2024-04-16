import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemModule } from './system/system.module';
import { DesignModule } from './design/design.module';

import { AuthModule } from './auth/auth.module';
import { OntologynModule } from 'src/ontology/ontology.module';
import { NodeModule } from 'src/node/node.module';
import { ExtractionModule } from 'src/extraction/extraction.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MinioClientModule } from './minio/minio-client.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'rbac',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: ['query', 'error'],
    }),
    SystemModule,
    DesignModule,
    OntologynModule,
    ExtractionModule,
    NodeModule,
    KnowledgeModule,
    MinioClientModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
