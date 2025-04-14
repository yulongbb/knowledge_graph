// redis.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { RedisService } from './redis.service';

@ApiTags('Redis 操作') // Swagger 分组标签
@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @ApiOperation({ summary: '设置键值对' })
  @ApiParam({ name: 'key', description: '键名' })
  @ApiParam({ name: 'value', description: '键值' })
  @Get('set/:key/:value')
  async setKey(@Param('key') key: string, @Param('value') value: string) {
    return await this.redisService.setValue(key, value);
  }

  @ApiOperation({ summary: '获取键的列表值（前 10 个元素）' })
  @ApiParam({ name: 'key', description: '键名' })
  @Get('get/:key')
  async getValue(@Param('key') key: string) {
    return await this.redisService.getValue(key);
  }

  @ApiOperation({ summary: '获取多个键的列表长度' })
  @ApiBody({
    description: '包含键名和名称的数组',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '键名' },
          name: { type: 'string', description: '名称' },
        },
      },
    },
  })
  @Post('number')
  async getNumber(@Body() ids: any) {
    return await this.redisService.getNumber(ids);
  }
}

