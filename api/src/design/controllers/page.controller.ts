import { Controller, UseGuards } from '@nestjs/common';
import { Page } from '../entities/page.entity';
import { PageService } from '../services/page.service';
import { AuthGuard } from '@nestjs/passport';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('pages')
@UseGuards(AuthGuard('jwt'))
@ApiTags('页面设计') // 分组
export class PageController extends XControllerService<Page, XQuery> {
  constructor(private readonly entityService: PageService) {
    super(entityService);
  }
}
