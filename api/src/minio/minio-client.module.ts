import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientService } from './minio-client.service';
import { MinioClientController } from './minio-client.controller';
import { MINIO_CONFIG } from './config';
import { ThumbnailService } from './thumbnail.service';

@Module({
  imports: [
    MinioModule.register({
      endPoint: MINIO_CONFIG.MINIO_ENDPOINT,
      port: MINIO_CONFIG.MINIO_PORT,
      useSSL: false,
      accessKey: MINIO_CONFIG.MINIO_ACCESSKEY,
      secretKey: MINIO_CONFIG.MINIO_SECRETKEY,
    }),
  ],
  controllers: [MinioClientController],
  providers: [MinioClientService,ThumbnailService],
})
export class MinioClientModule {}