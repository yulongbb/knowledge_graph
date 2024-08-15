// redis.service.ts

import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
 
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost', // Redis 服务器的主机名
      port: 6379, // Redis 服务器的端口
      password: 'root',
      db: 1
    });
  }

  setValue(key: string, value: string){
    return this.redisClient.set(key, value);
  }

  getValue(key: string) {
    return this.redisClient.lrange(key, 0, 10);
  }

  async getNumber(ids: any) {
    const data = await Promise.all(ids.map(async (id: any) => {
      const value = await this.redisClient.llen(id.id);
      return { id: id.id, value, name: id.name };
    }));
    return data;
  }
}

