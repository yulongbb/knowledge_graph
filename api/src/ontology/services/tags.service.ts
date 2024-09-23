import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagsService extends XRepositoryService<Tag, XQuery> {

    constructor(
        @InjectRepository(Tag)
        public readonly tagsRepository: Repository<Tag>,
        private dataSource: DataSource
    ) {
        super(tagsRepository, dataSource);
    }

}