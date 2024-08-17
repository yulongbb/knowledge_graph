import { Module } from '@nestjs/common';
import { FusionService } from './fusion.service';

import { FusionController } from './fusion.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';
import { EsService } from 'src/es/es.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [ArangoDbModule, ElasticsearchModule.register({
    node: 'http://localhost:9200',
  })],
  controllers: [FusionController],
  providers: [FusionService, EsService],
})
export class FusionModule {}
