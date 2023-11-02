import { Controller, UseGuards } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiTags('系统管理') // 分组
export class UsersController extends XControllerService<User, XQuery> {
  constructor(public readonly usersService: UsersService) {
    super(usersService);
  }
}
