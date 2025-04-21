import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Organization } from './entities/organization.entity';
import { orderBy } from 'lodash';

@Injectable()
export class OrganizationService extends XRepositoryService<Organization, XQuery> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private dataSource: DataSource
  ) {
    super(organizationRepository, dataSource);
  }

  /**
   * 获取组织详情
   * @param id 组织ID
   * @returns 组织实体
   */
  async get(id: XIdType): Promise<Organization> {
    return await this.organizationRepository.findOneBy({ id });
  }

  /**
   * 创建组织
   * @param entity 组织实体
   * @returns 创建后的组织
   */
  async post(entity: Organization): Promise<Organization> {
    let parent = null;
    if (entity.pid !== null) parent = await this.organizationRepository.findOneBy({ pid: entity.pid });
    return await this.organizationRepository.manager.transaction<Organization>(async (x) => {
      // 生成组织路径
      entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`;
      let result = await this.organizationRepository.save(entity);
      return result;
    });
  }

  /**
   * 更新组织
   * @param entity 组织实体
   * @returns 更新后的组织
   */
  async put(entity: Organization): Promise<Organization> {
    let find = await this.organizationRepository.findOneBy({ id: entity.id });
    if (find) {
      return await this.organizationRepository.manager.transaction(async (x) => {
        Object.assign(find, entity);
        let result = await this.organizationRepository.save(find);
        return result;
      });
    }
  }

  /**
   * 删除组织
   * @param id 组织ID
   * @returns 被删除的组织
   */
  async delete(id: XIdType): Promise<Organization> {
    let remove = await this.organizationRepository.findOneBy({ id });
    // 查找所有子组织
    let moves = await this.organizationRepository.find({ where: { path: Like(`${remove.path}%`) } });
    // 按路径长度倒序排列，确保先删除子组织
    moves = orderBy(moves, (x) => -x.path.length);
    for (let move of moves) {
      await this.organizationRepository.remove(move);
    }
    return remove;
  }
}
