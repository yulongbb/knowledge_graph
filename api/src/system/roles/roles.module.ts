import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Action } from '../actions/entities/action.entity';

/**
 * 角色管理模块
 * 提供角色的增删改查和权限分配功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Role, Action])],
  controllers: [RolesController],
  providers: [RolesService]
})
export class RolesModule {}
