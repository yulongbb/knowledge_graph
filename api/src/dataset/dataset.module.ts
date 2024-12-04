import { Module } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { Dataset } from './dataset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Dataset])],
  controllers: [DatasetController],
  providers: [DatasetService],
})
export class DatasetModule {}
