import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { Knowledge } from './knowledge.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Knowledge,Schema])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
})
export class KnowledgeModule {}
