import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Article } from './article.entity';

@Injectable()
export class ArticleService extends XRepositoryService<Article, XQuery> {

    constructor(
        @InjectRepository(Article)
        public readonly articlesRepository: Repository<Article>,
        private dataSource: DataSource
    ) {
        super(articlesRepository, dataSource);
    }

}
