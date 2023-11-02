import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemModule } from './system/system.module';
import { DesignModule } from './design/design.module';

import { AuthModule } from './auth/auth.module';
import { OntologynModule } from 'src/ontology/ontology.module';
import { FusionModule } from 'src/fusion/fusion.module';
import { ExtractionModule } from 'src/extraction/extraction.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MinioModule } from './minio/minio.module';

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
    FusionModule,
    KnowledgeModule,
    MinioModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
