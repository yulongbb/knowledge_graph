import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEntity } from './entities/api.entity';
import { ApiService } from './services/api.service';
import { ApiController } from './controller/api.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApiEntity])],
  providers: [ApiService],
  controllers: [ApiController],
})
export class SourceModule {}
