import { Module } from '@nestjs/common';
import { NodeService } from './node.service';

import { NodeController } from './node.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';
import { FusionService } from 'src/fusion/fusion.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';
import { EsModule } from 'src/es/es.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EsService } from 'src/es/es.service';
import { EdgeService } from './edge.service';
import { EdgeController } from './edge.controller';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [    ConfigModule.forRoot(),
    ArangoDbModule, EsModule, TypeOrmModule.forFeature([Schema, Property]), ElasticsearchModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      node: configService.get('ELASTICSEARCH_NODE'),
      // auth: {
      //   username: configService.get('ELASTICSEARCH_USER'),
      //   password: configService.get('ELASTICSEARCH_PASSWORD'),
      // },
    }),
  }),],
  controllers: [NodeController, EdgeController],
  exports: [EsService],

  providers: [
    {
      provide: 'DEFAULT_INDEX',
      useFactory: (configService: ConfigService) => configService.get('ELASTICSEARCH_INDEX', 'entity'),
      inject: [ConfigService],
    },
     NodeService, EdgeService, FusionService, PropertiesService, EsService, SchemasService],
     
})
export class NodeModule { }
