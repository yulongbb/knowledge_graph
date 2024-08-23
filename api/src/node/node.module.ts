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

@Module({  
  imports: [ArangoDbModule, EsModule, TypeOrmModule.forFeature([Schema, Property]), ElasticsearchModule.register({
    node: 'http://localhost:9200',
  })],
  controllers: [NodeController,EdgeController],
  providers: [NodeService,EdgeService, FusionService,PropertiesService, EsService], 
})
export class NodeModule {}
