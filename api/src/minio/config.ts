import { ConfigService } from '@nestjs/config';

export const getMinioConfig = (configService: ConfigService) => {
  return {
    MINIO_ENDPOINT: configService.get('MINIO_ENDPOINT'),
    MINIO_PORT: parseInt(configService.get('MINIO_PORT')),
    MINIO_ACCESSKEY: configService.get('MINIO_ACCESSKEY'),
    MINIO_SECRETKEY: configService.get('MINIO_SECRETKEY'),
    MINIO_USE_SSL: configService.get('MINIO_USE_SSL') === 'true',
    MINIO_BUCKET: configService.get('MINIO_BUCKET'),
  };
};