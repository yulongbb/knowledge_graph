import { Module } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { ExtractionController } from './extraction.controller';
import { Script } from './entities/script.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Script])],
  controllers: [ExtractionController],
  providers: [ExtractionService],
})
export class ExtractionModule {}
