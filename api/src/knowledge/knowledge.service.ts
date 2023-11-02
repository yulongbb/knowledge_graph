import { Injectable, Inject } from '@nestjs/common';
import { Knowledge } from './knowledge.entity';

import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';


@Injectable()
export class KnowledgeService extends XRepositoryService<Knowledge, XQuery> {
  constructor(
    @InjectRepository(Knowledge)
    public readonly propertiesRepository: Repository<Knowledge>,
    private dataSource: DataSource
  ) {
    super(propertiesRepository, dataSource);
  }

}
