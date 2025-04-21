import { Entity, Column, ManyToOne, PrimaryColumn, ManyToMany } from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_action')
export class Action {
  @ApiProperty({ description: '操作ID' })
  @PrimaryColumn('uuid', { length: 36, type: 'char' })
  id: string;

  @ApiProperty({ description: '操作名称' })
  @Column()
  name: string;

  @ApiProperty({ description: '操作代码' })
  @Column()
  code: string;

  @ApiProperty({ description: '排序' })
  @Column()
  sort?: number;

  @ApiProperty({ description: '图标' })
  @Column()
  icon: string;

  @ApiProperty({ description: '菜单ID' })
  @Column({ length: 36 })
  menuId: string;

  @ApiProperty({ description: '所属菜单', type: () => Menu })
  @ManyToOne(
    type => Menu,
    menu => menu.actions,
    { onDelete: 'CASCADE' }
  )
  menu: Menu;

  @ApiProperty({ description: '关联角色', type: () => [Role] })
  @ManyToMany(
    type => Role,
    role => role.actions
  )
  roles: Role[];
}
