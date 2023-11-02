import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { RolesModule } from './roles/roles.module';
import { MenusModule } from './menus/menus.module';
import { ActionsModule } from './actions/actions.module';

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
