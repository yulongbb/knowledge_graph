// redis.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('set/:key/:value')
  async setKey(@Param('key') key: string, @Param('value') value: string){
    return await this.redisService.setValue(key, value);
  }

  @Get('get/:key')
  async getValue(@Param('key') key: string) {
    return await this.redisService.getValue(key);
  }


  @Post('number')
  async getNumber(@Body() ids: any,) {
    return await this.redisService.getNumber(ids);
  }
}

