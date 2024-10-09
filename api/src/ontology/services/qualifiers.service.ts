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
    return this.qualifiersRepository.find( {where: {label: label }})
  }
 

}
