import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { RolesModule } from './roles/roles.module';
import { MenusModule } from './menus/menus.module';
import { ActionsModule } from './actions/actions.module';

/**
 * 系统管理模块
 * 整合了用户、组织、角色、菜单和操作权限等子模块
 */
@Module({
  imports: [
    UsersModule,
    OrganizationModule,
    RolesModule,
    MenusModule,
    ActionsModule,
  ],
})
export class SystemModule {}
