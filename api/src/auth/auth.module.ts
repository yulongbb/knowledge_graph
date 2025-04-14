import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../system/users/entities/user.entity';
import { Menu } from '../system/menus/entities/menu.entity';
import { Action } from '../system/actions/entities/action.entity';
import { Role } from '../system/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Menu, Action])], // 导入 TypeORM 模块
  providers: [AuthService, JwtStrategy], // 提供服务和策略
  controllers: [AuthController], // 控制器
})
export class AuthModule {}
