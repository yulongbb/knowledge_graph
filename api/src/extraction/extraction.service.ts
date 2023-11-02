import { Injectable, Inject } from '@nestjs/common';
import { Extraction } from './extraction.entity';

import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';


@Injectable()
export class ExtractionService extends XRepositoryService<Extraction, XQuery> {
  constructor(
    @InjectRepository(Extraction)
    public readonly propertiesRepository: Repository<Extraction>,
    private dataSource: DataSource
  ) {
    super(propertiesRepository, dataSource);
  }

}
