// Redis 模块，注册 RedisService 和 RedisController
import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService], // 注册 RedisService 作为提供者
  exports: [RedisService], // 导出 RedisService
  controllers: [RedisController], // 注册 RedisController
})
export class RedisModule {}
