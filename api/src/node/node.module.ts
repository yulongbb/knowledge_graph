import { Module } from '@nestjs/common';
import { NodeService } from './node.service';

import { NodeController } from './node.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';
import { FusionService } from 'src/fusion/fusion.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';

@Module({
  imports: [ArangoDbModule,TypeOrmModule.forFeature([Schema, Property])],
  controllers: [NodeController],
  providers: [NodeService, FusionService,PropertiesService], 
})
export class NodeModule {}
