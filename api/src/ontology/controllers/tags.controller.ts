import { Controller, Get, Param, Query } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { Tag } from '../entities/tag.entity';
import { TagsService } from '../services/tags.service';

@Controller('tags')
@ApiTags('标签管理') // 分组
export class TagsController extends XControllerService<Tag, XQuery> {
  constructor(public readonly tagsService: TagsService) {
    super(tagsService);
  }
  
  @Get('name/:name')
  async findByName(
    @Param('name') name: string,
    @Query('namespaceId') namespaceId?: string
  ): Promise<Tag> {
    return this.tagsService.findByNameAndNamespace(name, namespaceId);
  }
  
  @Get('namespace/:namespaceId')
  async findAllByNamespace(@Param('namespaceId') namespaceId: string): Promise<Tag[]> {
    return this.tagsService.findAllByNamespace(namespaceId);
  }
}
