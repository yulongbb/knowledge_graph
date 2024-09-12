import { Module } from '@nestjs/common';
import { FusionService } from './fusion.service';

import { FusionController } from './fusion.controller';

import { ArangoDbModule } from '../arangodb/arangodb.module';
import { EsService } from 'src/es/es.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [    ConfigModule.forRoot(),
    ArangoDbModule, ElasticsearchModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      node: configService.get('ELASTICSEARCH_NODE'),
      // auth: {
      //   username: configService.get('ELASTICSEARCH_USER'),
      //   password: configService.get('ELASTICSEARCH_PASSWORD'),
      // },
    }),
  }),
  ],
  controllers: [FusionController],
  exports: [EsService],

  providers: [
    {
      provide: 'DEFAULT_INDEX',
      useFactory: (configService: ConfigService) => configService.get('ELASTICSEARCH_INDEX', 'entity'),
      inject: [ConfigService],
    },
    FusionService, EsService],
})
export class FusionModule { }
