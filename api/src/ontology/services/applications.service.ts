import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Tag } from '../entities/tag.entity';
import { Application } from '../entities/application.entity';

@Injectable()
export class ApplicationsService extends XRepositoryService<Application, XQuery> {

    constructor(
        @InjectRepository(Application)
        public readonly applicationsRepository: Repository<Application>,
        private dataSource: DataSource
    ) {
        super(applicationsRepository, dataSource);
    }

}