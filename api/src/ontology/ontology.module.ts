import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';
import { SchemasController } from 'src/ontology/controllers/schemas.controller';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { PropertiesController } from 'src/ontology/controllers/properties.controller';
import { TagsService } from './services/tags.service';
import { TagsController } from './controllers/tags.controller';
import { Tag } from './entities/tag.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Schema, Property, Tag])],
  controllers: [SchemasController, PropertiesController, TagsController],
  providers: [SchemasService, PropertiesService, TagsService]
})
export class OntologynModule {}
