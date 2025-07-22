import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { ApiEntity } from '../entities/api.entity';

@Injectable()
export class ApiService extends XRepositoryService<ApiEntity, XQuery> {
  constructor(
    @InjectRepository(ApiEntity)
    public readonly apiRepository: Repository<ApiEntity>,
    private dataSource: DataSource,
  ) {
    super(apiRepository, dataSource);
  }
}
