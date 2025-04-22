import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Dataset } from './dataset.entity';

@Injectable()
export class DatasetService extends XRepositoryService<Dataset, XQuery> {

    constructor(
        @InjectRepository(Dataset)
        public readonly datasetsRepository: Repository<Dataset>,
        private dataSource: DataSource
    ) {
        super(datasetsRepository, dataSource);
    }

}