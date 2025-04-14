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

  /**
   * 设置键值对到 Redis 中
   * @param key 键名
   * @param value 键值
   */
  setValue(key: string, value: string) {
    return this.redisClient.set(key, value);
  }

  /**
   * 获取 Redis 中指定键的列表值（前 10 个元素）
   * @param key 键名
   */
  getValue(key: string) {
    return this.redisClient.lrange(key, 0, 10);
  }

  /**
   * 获取多个键的列表长度
   * @param ids 包含键名和名称的数组
   * @returns 包含键名、列表长度和值的数组
   */
  async getNumber(ids: any) {
    const data = await Promise.all(ids.map(async (id: any) => {
      const value = await this.redisClient.llen(id.id);
      return { id: id.id, value, name: id.name };
    }));
    return data;
  }
}

