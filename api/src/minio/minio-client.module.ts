import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientService } from './minio-client.service';
import { MinioClientController } from './minio-client.controller';
import { MINIO_CONFIG } from './config';
import { ThumbnailService } from './thumbnail.service';

@Module({
  imports: [
    HttpModule,
    MinioModule.register({
      endPoint: MINIO_CONFIG.MINIO_ENDPOINT,
      port: MINIO_CONFIG.MINIO_PORT,
      useSSL: false,
      accessKey: MINIO_CONFIG.MINIO_ACCESSKEY,
      secretKey: MINIO_CONFIG.MINIO_SECRETKEY,
    }),
  ],
  controllers: [MinioClientController],
  providers: [MinioClientService, ThumbnailService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
