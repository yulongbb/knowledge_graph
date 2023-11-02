import { Controller, UseGuards } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Action } from './entities/action.entity';
import { ActionsService } from './actions.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('actions')
@UseGuards(AuthGuard('jwt'))
@ApiTags('系统管理') // 分组
export class ActionsController extends XControllerService<Action, XQuery> {
  constructor(private readonly entityService: ActionsService) {
    super(entityService);
  }
}
