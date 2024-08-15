// redis.module.ts
import { Module } from '@nestjs/common';
import { EsController } from './es.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EsService } from './es.service';

@Module({
  imports: [ElasticsearchModule.register({
    node: 'http://localhost:9200',
  })],
  providers: [EsService], // 注册 ElasticsearchService 作为提供者
  controllers: [EsController],
})
export class EsModule {}
