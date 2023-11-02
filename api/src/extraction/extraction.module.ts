import { Module } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { ExtractionController } from './extraction.controller';
import { Extraction } from './extraction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Extraction])],
  controllers: [ExtractionController],
  providers: [ExtractionService],
})
export class ExtractionModule {}
