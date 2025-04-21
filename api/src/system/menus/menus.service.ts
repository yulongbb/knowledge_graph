import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Menu } from './entities/menu.entity';
import { Action } from '../../system/actions/entities/action.entity';
import { orderBy } from 'lodash';

@Injectable()
export class MenusService extends XRepositoryService<Menu, XQuery> {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    private dataSource: DataSource
  ) {
    super(menuRepository, dataSource);
  }

  /**
   * 获取菜单详情
   * @param id 菜单ID
   * @returns 菜单实体
   */
  async get(id: XIdType): Promise<Menu> {
    return await this.menuRepository.findOneBy({ id: id });
  }

  /**
   * 创建菜单
   * @param entity 菜单实体
   * @returns 创建后的菜单
   */
  async post(entity: Menu): Promise<Menu> {
    console.log(entity)
    let parent = null;
    if (entity.pid !== null) parent = await this.menuRepository.findOneBy({ pid: entity.pid });
    return await this.actionRepository.manager.transaction<Menu>(async (x) => {
      // 生成菜单路径
      entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`;
      let result = await this.menuRepository.save(entity);
      return result;
    });
  }

  /**
   * 更新菜单
   * @param entity 菜单实体
   * @returns 更新后的菜单
   */
  async put(entity: Menu): Promise<Menu> {
    let menu = await this.menuRepository.findOne({ where: { id: entity.id }, relations: ['actions'] });
    if (menu) {
      return await this.actionRepository.manager.transaction(async (x) => {
        Object.assign(menu, entity);
        let result = await this.menuRepository.save(menu);
        return result;
      });
    }
  }

  /**
   * 删除菜单
   * @param id 菜单ID
   * @returns 被删除的菜单
   */
  async delete(id: XIdType): Promise<Menu> {
    let remove = await this.menuRepository.findOneBy({ id });
    // 查找所有子菜单
    let moves = await this.menuRepository.find({ where: { path: Like(`${remove.path}%`) } });
    // 按路径长度倒序排列，确保先删除子菜单
    moves = orderBy(moves, (x) => -x.path.length);
    for (let move of moves) {
      await this.menuRepository.remove(move);
    }
    return remove;
  }
}
