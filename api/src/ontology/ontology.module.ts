import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';
import { SchemasController } from 'src/ontology/controllers/schemas.controller';
import { SchemasService } from 'src/ontology/services/schemas.service';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { PropertiesController } from 'src/ontology/controllers/properties.controller';
import { Knowledge } from 'src/knowledge/knowledge.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Schema, Property,  Knowledge])],
  controllers: [SchemasController, PropertiesController],
  providers: [SchemasService, PropertiesService]
})
export class OntologynModule {}
