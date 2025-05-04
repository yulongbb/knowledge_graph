import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { Article } from './article.entity';
import { ArticleService } from './article.service';

@Controller('article')
@ApiTags('文章管理')
export class ArticleController extends XControllerService<Article, XQuery> {
  constructor(public readonly articlesService: ArticleService) {
    super(articlesService);
  }
}
