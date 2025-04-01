import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemModule } from './system/system.module';
import { DesignModule } from './design/design.module';
import { AuthModule } from './auth/auth.module';
import { OntologynModule } from 'src/ontology/ontology.module';
import { MinioClientModule } from './minio/minio-client.module';
import { RedisModule } from './redis/redis.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { DatasetModule } from './dataset/dataset.module';
import { ChatModule } from './chat/chat.module';
import { PluginModule } from './plugin/plugin.module';
import { AddonModule } from './addons/addon.module';
import { ProjectModule } from './project/project.module';
import { GptManagementModule } from './gpt-management/gpt-management.module';
import { MarkerModule } from './marker/marker.module';
import { ThreeDModelModule } from './3d-model/3d-model.module';

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
    DesignModule,
    OntologynModule,
    KnowledgeModule,
    DatasetModule,
    MinioClientModule,
    AuthModule,
    RedisModule,
    ChatModule,
    PluginModule,
    AddonModule,
    ProjectModule,
    GptManagementModule,
    MarkerModule,
    ThreeDModelModule,
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
