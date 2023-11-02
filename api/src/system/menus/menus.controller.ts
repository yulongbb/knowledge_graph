import { Controller, UseGuards } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Menu } from './entities/menu.entity';
import { MenusService } from './menus.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('menus')
@UseGuards(AuthGuard('jwt'))
@ApiTags('系统管理') // 分组
export class MenusController extends XControllerService<Menu, XQuery> {
  constructor(private readonly menusService: MenusService) {
    super(menusService);
  }
}
