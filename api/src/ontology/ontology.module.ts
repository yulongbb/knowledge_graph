import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';
import { SchemasController } from 'src/ontology/controllers/schemas.controller';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { PropertiesController } from 'src/ontology/controllers/properties.controller';
import { QualifiersService } from 'src/ontology/services/qualifiers.service';
import { QualifiersController } from 'src/ontology/controllers/qualifiers.controller';
import { TagsService } from './services/tags.service';
import { TagsController } from './controllers/tags.controller';
import { Tag } from './entities/tag.entity';
import { Qualify } from './entities/qualify.entity';
import { Application } from './entities/application.entity';
import { ApplicationsController } from './controllers/applications.controller';
import { ApplicationsService } from './services/applications.service';


@Module({
  imports: [TypeOrmModule.forFeature([Schema, Property, Qualify, Tag, Application])],
  controllers: [SchemasController, PropertiesController, QualifiersController, TagsController, ApplicationsController],
  providers: [SchemasService, PropertiesService, QualifiersService, TagsService, ApplicationsService]
})
export class OntologynModule { }
