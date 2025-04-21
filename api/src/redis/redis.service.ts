// redis.service.ts

import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async setValue(key: string, value: string): Promise<string> {
    return this.redis.set(key, value);
  }

  async getValue(key: string): Promise<any> {
    // 检查键是否是列表类型
    const type = await this.redis.type(key);
    
    if (type === 'list') {
      // 如果是列表，返回前10个元素
      return this.redis.lrange(key, 0, 9);
    } else {
      // 否则尝试获取字符串值
      return this.redis.get(key);
    }
  }

  async getNumber(ids: any[]): Promise<any[]> {
    const result = [];
    
    for (const item of ids) {
      const count = await this.redis.llen(item.id);
      result.push({
        id: item.id,
        name: item.name,
        count: count
      });
    }
    
    return result;
  }
}

