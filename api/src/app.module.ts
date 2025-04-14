import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemModule } from './system/system.module';
import { AuthModule } from './auth/auth.module';
import { OntologynModule } from 'src/ontology/ontology.module';
import { MinioClientModule } from './minio/minio-client.module';
import { RedisModule } from './redis/redis.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AddonModule } from './addons/addon.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'kgms',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: ['query', 'error'],
    }),
    SystemModule,
    OntologynModule,
    KnowledgeModule,
    MinioClientModule,
    AuthModule,
    RedisModule,
    AddonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: any, next: Function) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
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
