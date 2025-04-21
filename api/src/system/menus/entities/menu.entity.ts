import { Entity, Column, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Action } from '../../actions/entities/action.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_menu')
export class Menu {
  @ApiProperty({ description: '菜单ID' })
  @PrimaryColumn('uuid', { length: 36 })
  id: string;

  @ApiProperty({ description: '菜单名称' })
  @Column()
  label: string;

  @ApiProperty({ description: '路由地址' })
  @Column()
  router?: string;

  @ApiProperty({ description: '图标' })
  @Column()
  icon: string;

  @ApiProperty({ description: '排序' })
  @Column()
  sort?: number;

  @ApiProperty({ description: '父级ID' })
  @Column({ nullable: true, length: 36, name: 'parentId' })
  pid?: string;

  @ApiProperty({ description: '菜单路径', example: '1.2.3' })
  @Column({ nullable: true, type: 'text' })
  path?: string;

  @ApiProperty({ description: '父级菜单', type: () => Menu })
  @ManyToOne(
    type => Menu,
    menu => menu.children
  )
  parent: Menu;

  @ApiProperty({ description: '子菜单', type: () => [Menu] })
  @OneToMany(
    type => Menu,
    menu => menu.parent
  )
  children: Menu[];

  @ApiProperty({ description: '操作权限', type: () => [Action] })
  @OneToMany(
    type => Action,
    action => action.menu
  )
  actions: Action[];
}
