// redis.module.ts
import { Module } from '@nestjs/common';
import { EsController } from './es.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EsService } from './es.service';
import { NLPService } from './nlp.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ElasticsearchModule.registerAsync({
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
  providers: [
    {
      provide: 'DEFAULT_INDEX',
      useFactory: (configService: ConfigService) => configService.get('ELASTICSEARCH_INDEX', 'entity'),
      inject: [ConfigService],
    },
    EsService,
    NLPService
  ],
  exports: [EsService],

  controllers: [EsController],
})
export class EsModule {}
