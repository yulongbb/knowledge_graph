import { Entity, Column, ManyToMany, PrimaryColumn, JoinTable, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Action } from '../../actions/entities/action.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity("system_role")
export class Role {
    @ApiProperty({ description: '角色ID' })
    @PrimaryColumn("uuid", { length: 36 })
    id: string;

    @ApiProperty({ description: '角色名称' })
    @Column()
    name: string;

    @ApiProperty({ description: '组织ID' })
    @Column({ length: 36 })
    organizationId: string;

    @ApiProperty({ description: '所属组织', type: () => Organization })
    @ManyToOne(type => Organization, organization => organization.roles, { onDelete: 'CASCADE' })
    organization: Organization;

    @ApiProperty({ description: '拥有此角色的用户', type: () => [User] })
    @ManyToMany(type => User, user => user.roles)
    @JoinTable({
        name: "system_user_role",
        joinColumn: { name: 'roleId' },
        inverseJoinColumn: { name: 'userId' }
    })
    users: User[];

    @ApiProperty({ description: '角色权限', type: () => [Action] })
    @ManyToMany(type => Action, action => action.roles)
    @JoinTable({
        name: "system_role_action",
        joinColumn: { name: 'roleId' },
        inverseJoinColumn: { name: 'actionId' }
    })
    actions: Action[];
}