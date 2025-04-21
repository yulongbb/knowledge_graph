import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get port(): number {
    return parseInt(this.configService.get<string>('APP_PORT', '3000'), 10);
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX', 'api');
  }
  
  get databaseConfig() {
    return {
      host: this.configService.get<string>('DB_HOST'),
      port: parseInt(this.configService.get<string>('DB_PORT'), 10),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      synchronize: this.configService.get<string>('DB_SYNC') === 'true',
      logging: this.configService.get<string>('DB_LOGGING').split(','),
    };
  }
  
  get elasticsearchConfig() {
    return {
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      username: this.configService.get<string>('ELASTICSEARCH_USER'),
      password: this.configService.get<string>('ELASTICSEARCH_PASSWORD'),
      index: this.configService.get<string>('ELASTICSEARCH_INDEX'),
    };
  }
  
  get arangodbConfig() {
    return {
      url: this.configService.get<string>('ARANGODB_URL'),
      user: this.configService.get<string>('ARANGODB_USER'),
      password: this.configService.get<string>('ARANGODB_PASSWORD'),
      dbName: this.configService.get<string>('ARANGODB_NAME'),
    };
  }
  
  get redisConfig() {
    return {
      host: this.configService.get<string>('REDIS_HOST'),
      port: parseInt(this.configService.get<string>('REDIS_PORT'), 10),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: parseInt(this.configService.get<string>('REDIS_DB'), 10),
    };
  }
  
  get jwtConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      expires: parseInt(this.configService.get<string>('JWT_EXPIRES'), 10),
    };
  }
  
  get minioConfig() {
    return {
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT'), 10),
      accessKey: this.configService.get<string>('MINIO_ACCESSKEY'),
      secretKey: this.configService.get<string>('MINIO_SECRETKEY'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      bucket: this.configService.get<string>('MINIO_BUCKET'),
    };
  }
}
