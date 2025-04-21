import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Role } from './entities/role.entity';
import { Action } from '../actions/entities/action.entity';
import { filter, find, remove } from 'lodash';

@Injectable()
export class RolesService extends XRepositoryService<Role, XQuery> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    private dataSource: DataSource
  ) {
    super(roleRepository, dataSource);
  }

  /**
   * 获取角色详情
   * @param id 角色ID
   * @returns 角色实体，包含组织关系
   */
  async get(id: XIdType): Promise<Role> {
    return await this.roleRepository.findOne({ where: { id }, relations: ['organization'] });
  }

  /**
   * 获取角色在指定菜单下的操作权限
   * @param id 角色ID
   * @param menuId 菜单ID
   * @returns 操作权限列表
   */
  async getActions(id: XIdType, menuId: XIdType): Promise<Action[]> {
    let qb = this.actionRepository
      .createQueryBuilder('entity')
      .leftJoin('entity.roles', 'role')
      .select(['entity.id', 'entity.name', 'entity.code'])
      .where('entity.menuId = :menuId')
      .andWhere('role.id = :id');

    qb.setParameters({
      id: id,
      menuId: menuId
    });

    return await qb.getMany();
  }

  /**
   * 更新角色在指定菜单下的操作权限
   * @param id 角色ID
   * @param menuId 菜单ID
   * @param actions 操作权限列表
   * @returns 操作结果
   */
  async putActions(id: XIdType, menuId: XIdType, actions: Action[]): Promise<any> {
    let role = await this.roleRepository.findOne({ where: { id }, relations: ['actions'] });
    // 移除不存在的权限
    remove(role.actions, (y) => !find(actions, (z) => z.id === y.id) && y.menuId === menuId);
    // 添加新的权限
    role.actions = [...role.actions, ...filter(actions, (y) => !find(role.actions, (z) => y.id === z.id))];
    await this.roleRepository.save(role);
  }
}
