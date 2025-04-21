import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_user')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @ApiProperty({ description: '用户姓名' })
  @Column({ length: 36 })
  name: string;

  @ApiProperty({ description: '账号' })
  @Column()
  account: string;

  @ApiProperty({ description: '密码' })
  @Column({default:''})
  password: string;

  @ApiProperty({ description: '电子邮箱' })
  @Column()
  email: string;

  @ApiProperty({ description: '电话号码' })
  @Column()
  phone: string;

  @ApiProperty({ description: '所属组织', type: () => [Organization] })
  @ManyToMany(
    type => Organization,
    organization => organization
  )
  @JoinTable({
    name: 'system_user_organization',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'organizationId' }
  })
  organizations: Organization[];

  @ApiProperty({ description: '拥有角色', type: () => [Role] })
  @ManyToMany(
    type => Role,
    role => role
  )
  @JoinTable({
    name: 'system_user_role',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'roleId' }
  })
  roles: Role[];
}