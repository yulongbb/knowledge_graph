import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
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
  
  getPropertyByName(name: string): Promise<any> {
    console.log(name);
    return this.propertiesRepository.findOne({ where: { name }, relations: ['schemas'] });
  }

  async getPropertyByNameAndNamespace(name: string, namespaceId?: string): Promise<Property> {
    const query = { name };
    if (namespaceId) {
      return this.propertiesRepository.findOne({ 
        where: { ...query, namespaceId },
        relations: ['schemas'] 
      });
    }
    return this.propertiesRepository.findOne({ 
      where: query,
      relations: ['schemas'] 
    });
  }
  
  async findAllByNamespace(namespaceId: string): Promise<Property[]> {
    return this.propertiesRepository.find({ where: { namespaceId } });
  }
}
