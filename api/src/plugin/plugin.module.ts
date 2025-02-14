import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { Plugin } from './entities/plugin.entity';
import { PluginMessage } from './entities/plugin-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plugin,PluginMessage]),
    HttpModule,
  ],
  providers: [PluginService],
  controllers: [PluginController],
})
export class PluginModule {}
