import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Dictionary } from '../entities/dictionary.entity';

@Injectable()
export class DictionaryService extends XRepositoryService<Dictionary, XQuery> {
  constructor(
    @InjectRepository(Dictionary)
    public readonly dictionaryRepository: Repository<Dictionary>,
    private dataSource: DataSource
  ) {
    super(dictionaryRepository, dataSource);
  }

  async findByPropertyId(propertyId: string): Promise<Dictionary[]> {
    return this.dictionaryRepository.find({
      where: { propertyId }
    });
  }
  
  async findByPropertyIdAndNamespace(propertyId: string, namespaceId?: string): Promise<Dictionary[]> {
    const query = { propertyId };
    if (namespaceId) {
      return this.dictionaryRepository.find({ where: { ...query, namespaceId } });
    }
    return this.dictionaryRepository.find({ where: query });
  }
  
  async findAllByNamespace(namespaceId: string): Promise<Dictionary[]> {
    return this.dictionaryRepository.find({ where: { namespaceId } });
  }
}
