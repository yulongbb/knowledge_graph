import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Property } from 'src/ontology/entities/property.entity';
import { Qualify } from '../entities/qualify.entity';

@Injectable()
export class QualifiersService extends XRepositoryService<Qualify, XQuery> {
  constructor(
    @InjectRepository(Qualify)
    public readonly qualifiersRepository: Repository<Qualify>,
    private dataSource: DataSource
  ) {
    super(qualifiersRepository, dataSource);
  }
  
  getQualifyByLabel(label: string): Promise<any> {
    return this.qualifiersRepository.find({ where: { label } });
  }
  
  async getQualifyByLabelAndNamespace(label: string, namespaceId?: string): Promise<Qualify[]> {
    const query = { label };
    if (namespaceId) {
      return this.qualifiersRepository.find({ where: { ...query, namespaceId } });
    }
    return this.qualifiersRepository.find({ where: query });
  }
  
  async findAllByNamespace(namespaceId: string): Promise<Qualify[]> {
    return this.qualifiersRepository.find({ where: { namespaceId } });
  }
}
