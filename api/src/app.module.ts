import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemModule } from './system/system.module';
import { AuthModule } from './auth/auth.module';
import { OntologynModule } from 'src/ontology/ontology.module';
import { MinioClientModule } from './minio/minio-client.module';
import { RedisModule } from './redis/redis.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ArticleModule } from './article/article.module';
import { ProjectModule } from './project/project.module';
import { ExtractionModule } from './extraction/extraction.module';
import { CategoryModule } from './category/category.module';
import { SourceModule } from './source/source.moduel';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 根据 NODE_ENV 加载对应的环境配置文件，默认为开发环境
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      // 允许使用默认.env作为备用
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC') === 'true',
        logging: configService.get('DB_LOGGING').split(','),
      }),
    }),
    SystemModule,
    OntologynModule,
    KnowledgeModule,
    MinioClientModule,
    AuthModule,
    RedisModule,
    ArticleModule,
    ProjectModule,
    ExtractionModule,
    CategoryModule,
    SourceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // eslint-disable-next-line @typescript-eslint/ban-types
      .apply((req: Request, res: any, next: Function) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
          'Access-Control-Allow-Methods',
          'GET,PUT,POST,DELETE,OPTIONS',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Accept, Authorization',
        );
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      })
      .forRoutes('*');
  }
}
