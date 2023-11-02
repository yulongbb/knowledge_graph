import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Body,
  } from '@nestjs/common';
  import { MinioService } from './minio.service';
  import { XIdType, XQuery } from 'src/core';
  import { ApiTags } from '@nestjs/swagger';
  
  @Controller('minio')
  @ApiTags('文件上传') // 分组
  
  export class MinioController {
    constructor(private readonly minioService: MinioService) {}

    
  }