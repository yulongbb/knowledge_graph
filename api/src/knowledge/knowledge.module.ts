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
import Redis from 'ioredis';
import { BatchTaskService } from './batch-task.service';

/**
 * 知识图谱模块
 * 整合了知识图谱的所有功能，包括实体管理、关系管理、搜索、NLP等
 */
@Module({
  imports: [
    // 配置BullMQ队列
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
    // 注册数据导入队列
    BullModule.registerQueue({
      name: 'data-import-queue',
    }),
    // 导入实体关系模型
    TypeOrmModule.forFeature([Schema, Property]),
    // 配置Elasticsearch连接
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
    // 配置ArangoDB连接
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
    // 默认索引名称
    {
      provide: 'DEFAULT_INDEX',
      useFactory: (configService: ConfigService) =>
        configService.get('ELASTICSEARCH_INDEX'),
      inject: [ConfigService],
    },
    // 各种服务注册
    DataImportService, // 数据导入服务
    NodeService,       // 节点服务
    EdgeService,       // 边服务
    EsService,         // ES搜索服务
    NLPService,        // 自然语言处理服务
    KnowledgeService,  // 知识管理服务
    PropertiesService, // 属性服务
    SchemasService,    // 模式服务
    BatchTaskService,
    {
      provide: 'REDIS',
      useFactory: (configService: ConfigService) => 
        new Redis({
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
          db: parseInt(configService.get('REDIS_DB')),
        }),
      inject: [ConfigService],
    },
  ],
})
export class KnowledgeModule {}
