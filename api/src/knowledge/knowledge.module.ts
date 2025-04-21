import { Module } from '@nestjs/common';
import { NodeService } from './node.service';

import { PropertiesService } from 'src/ontology/services/properties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EdgeService } from './edge.service';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnowledgeService } from './knowledge.service';
import { EsService } from './es.service';
import { Database } from 'arangojs';
import { KnowledgeController } from './knowledge.controller';
import { NLPService } from './nlp.service';
import { BullModule } from '@nestjs/bullmq';
import { DataImportService } from './data-import.queue';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),
    // 注册队列
    BullModule.registerQueue({
      name: 'data-import-queue',
    }),
    TypeOrmModule.forFeature([Schema, Property]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USER'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
      }),
    }),
  ],
  controllers: [KnowledgeController],
  exports: [EsService, DataImportService],
  providers: [
    {
      provide: 'ARANGODB',
      useFactory: (configService: ConfigService) =>
        new Database({
          url: configService.get('ARANGODB_URL'),
          databaseName: configService.get('ARANGODB_NAME'),
          auth: {
            username: configService.get('ARANGODB_USER'),
            password: configService.get('ARANGODB_PASSWORD'),
          },
        }),
      inject: [ConfigService],
    },
    {
      provide: 'DEFAULT_INDEX',
      useFactory: (configService: ConfigService) =>
        configService.get('ELASTICSEARCH_INDEX'),
      inject: [ConfigService],
    },
    DataImportService,
    NodeService,
    EdgeService,
    EsService,
    NLPService,
    KnowledgeService,
    PropertiesService,
    EsService,
    SchemasService,
  ],
})
export class KnowledgeModule {}
