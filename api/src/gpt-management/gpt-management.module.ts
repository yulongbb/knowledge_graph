import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GptManagementService } from './gpt-management.service';
import { GptManagementController } from './gpt-management.controller';
import { GptModel } from './entities/gpt-model.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GptModel]),
    MulterModule.register({
      dest: './uploads/logos',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/api/uploads',
    }),
  ],
  providers: [GptManagementService],
  controllers: [GptManagementController],
})
export class GptManagementModule {}
