import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AddonService } from './addon.service';
import { AddonController } from './addon.controller';
import { Addon } from './entities/addon.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Addon]),
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
  ],
  providers: [AddonService],
  controllers: [AddonController],
})
export class AddonModule {}
