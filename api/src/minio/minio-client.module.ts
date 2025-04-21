import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientService } from './minio-client.service';
import { MinioClientController } from './minio-client.controller';
import { ThumbnailService } from './thumbnail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMinioConfig } from './config';

@Module({
  imports: [
    HttpModule,
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const minioConfig = getMinioConfig(configService);
        return {
          endPoint: minioConfig.MINIO_ENDPOINT,
          port: minioConfig.MINIO_PORT,
          useSSL: minioConfig.MINIO_USE_SSL,
          accessKey: minioConfig.MINIO_ACCESSKEY,
          secretKey: minioConfig.MINIO_SECRETKEY,
        };
      },
    }),
  ],
  controllers: [MinioClientController],
  providers: [MinioClientService, ThumbnailService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
