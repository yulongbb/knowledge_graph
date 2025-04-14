import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AddonService } from './addon.service';
import { AddonController } from './addon.controller';
import { Addon } from './entities/addon.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    // 导入TypeOrm模块以支持数据库操作
    TypeOrmModule.forFeature([Addon]),
    // 配置Elasticsearch模块
    ElasticsearchModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          node: configService.get('ELASTICSEARCH_NODE'),
          // auth: {
          //   username: configService.get('ELASTICSEARCH_USER'),
          //   password: configService.get('ELASTICSEARCH_PASSWORD'),
          // },
        }),
      }),
    // 配置Multer模块以支持文件上传
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  // 提供服务和控制器
  providers: [AddonService],
  controllers: [AddonController],
})
export class AddonModule {}
