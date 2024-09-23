import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { Tag } from '../entities/tag.entity';
import { TagsService } from '../services/tags.service';

@Controller('tags')
@ApiTags('标签管理') // 分组
export class TagsController extends XControllerService<Tag, XQuery> {
  constructor(public readonly tagsService: TagsService) {
    super(tagsService);
  }

}
