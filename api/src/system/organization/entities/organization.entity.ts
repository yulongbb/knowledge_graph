import { Entity, Column, ManyToOne, OneToMany, ManyToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_organization')
export class Organization {
  @ApiProperty({ description: '组织ID' })
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @ApiProperty({ description: '组织名称' })
  @Column()
  label: string;

  @ApiProperty({ description: '组织类型' })
  @Column()
  type: string;

  @ApiProperty({ description: '组织图标' })
  @Column()
  icon: string;

  @ApiProperty({ description: '排序' })
  @Column()
  sort?: number;

  @ApiProperty({ description: '父级ID' })
  @Column({ nullable: true, length: 36, name: 'parentId' })
  pid?: string;

  @ApiProperty({ description: '组织路径', example: '1.2.3' })
  @Column({ nullable: true, type: 'text' })
  path?: string;

  @ApiProperty({ description: '父级组织', type: () => Organization })
  @ManyToOne(
    () => Organization,
    organization => organization.children
  )
  parent: Organization;

  @ApiProperty({ description: '子组织', type: () => [Organization] })
  @OneToMany(
    () => Organization,
    organization => organization.parent
  )
  children: Organization[];

  @ApiProperty({ description: '组织用户', type: () => [User] })
  @ManyToMany(
    () => User,
    user => user.organizations
  )
  users: User[];

  @ApiProperty({ description: '组织角色', type: () => [Role] })
  @OneToMany(
    type => Role,
    role => role.organization
  )
  roles: Role[];
}
