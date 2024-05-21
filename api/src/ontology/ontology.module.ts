import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';
import { SchemasController } from 'src/ontology/controllers/schemas.controller';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { PropertiesController } from 'src/ontology/controllers/properties.controller';
import { Type } from './entities/type.entity';
import { TypesController } from './controllers/types.compopnent';
import { TypesService } from './services/types.service';
import { Knowledge } from 'src/knowledge/knowledge.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Schema, Property, Type, Knowledge])],
  controllers: [SchemasController, PropertiesController, TypesController],
  providers: [SchemasService, PropertiesService, TypesService]
})
export class OntologynModule {}
