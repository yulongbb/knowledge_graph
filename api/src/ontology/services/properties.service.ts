import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Schema } from 'src/ontology/entities/schema.entity';
import { Property } from 'src/ontology/entities/property.entity';

@Injectable()
export class PropertiesService extends XRepositoryService<Property, XQuery> {

  constructor(
    @InjectRepository(Property)
    public readonly propertiesRepository: Repository<Property>,
    private dataSource: DataSource
  ) {
    super(propertiesRepository, dataSource);
  }
  

}
