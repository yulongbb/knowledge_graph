import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import {
  XQuery,
  XFilter,
  XGroupItem,
  XSort,
  XId,
  XResultList,
  XIdType,
} from '../interfaces';
import { orderBy, slice, map } from 'lodash';

/**
 * 通用仓库服务基类
 * 提供基础的CRUD操作和查询功能
 * @typeparam Entity 实体类型，必须继承XId
 * @typeparam Query 查询参数类型，必须继承XQuery
 */
@Injectable()
export class XRepositoryService<Entity extends XId, Query extends XQuery> {
  constructor(
    private repository: Repository<Entity>,
    private dataSouce: DataSource,
  ) {}

  /**
   * 获取分页列表数据
   * @param index 页码
   * @param size 每页大小
   * @param query 查询条件
   * @returns 分页结果，包含总数和数据列表
   */
  async getList(
    index: number,
    size: number,
    query: Query,
  ): Promise<XResultList<Entity | XGroupItem>> {
    return new Promise<XResultList<Entity | XGroupItem>>(async (x) => {
      const qb = this.repository.createQueryBuilder('entity');
      let list: Entity[] | XGroupItem[] = [];
      let total: number = 0;
      this.setFilter(qb, query.filter);
      if (query.group) {
        // 分组查询
        let group = await this.setGroup(qb, query.group);
        const sort = this.transformSort(query.sort, '');
        group = orderBy(
          group,
          map(sort, (v, k) => k),
          map(sort, (v: string) => v.toLowerCase() as 'desc' | 'asc'),
        );
        const start = size * (index - 1);
        const end = start + size;
        list = slice(group, start, end);
        total = group.length;
      } else {
        // 普通查询
        this.setSort(qb, query.sort);
        list = await qb
          .skip(size * (index - 1))
          .take(size)
          .getMany();
        total = await qb.getCount();
      }
      const result: XResultList<Entity | XGroupItem> = {
        list: list,
        total: total,
        query: query,
      };
      x(result);
    });
  }

  /**
   * 设置查询过滤条件
   * @param rep 查询构建器
   * @param filter 过滤条件数组
   */
  private setFilter(rep: SelectQueryBuilder<Entity>, filter: XFilter[]) {
    if (filter && filter.length > 0) {
      const param = {};
      filter.forEach((x, index) => {
        param[`param${index}`] = x.value;
        if (x.relation) {
          // 关联查询
          rep = rep.leftJoin(`entity.${x.relation}`, x.relation);
          switch (x.operation) {
            case '=':
              rep.andWhere(`${x.relation}.${x.field} = :param${index}`);
              break;
            case 'IN':
              rep.andWhere(`${x.relation}.${x.field} IN (:...param${index})`);
              break;
          }
        } else {
          // 普通查询
          switch (x.operation) {
            case '=':
              rep.andWhere(`entity.${x.field} = :param${index}`);
              break;
            case '>':
              rep.andWhere(`entity.${x.field} > :param${index}`);
              break;
            case '>=':
              rep.andWhere(`entity.${x.field} >= :param${index}`);
              break;
            case '<':
              rep.andWhere(`entity.${x.field} < :param${index}`);
              break;
            case '<=':
              rep.andWhere(`entity.${x.field} <= :param${index}`);
              break;
            case 'IN':
              rep.andWhere(`entity.${x.field} IN (:...param${index})`);
              break;
            default:
              // '%'模糊查询
              rep.andWhere(`entity.${x.field} LIKE concat('%', :param${index}, '%')`);
              break;
          }
        }
      });
      rep.setParameters(param);
    }
  }

  /**
   * 获取单个实体
   * @param id 实体ID
   * @returns 实体对象
   */
  async get(id: XIdType): Promise<Entity> {
    return await this.repository.findOneBy({ id });
  }

  /**
   * 创建实体
   * @param entity 实体对象
   * @returns 创建后的实体
   */
  async post(entity: any): Promise<Entity> {
    return await this.repository.save(entity);
  }

  /**
   * 更新实体
   * @param entity 实体对象
   * @returns 更新后的实体
   */
  async put(entity: Entity): Promise<Entity> {
    const index = await this.repository.findOneBy({ id: entity.id });
    if (index) {
      Object.assign(index, entity);
      await this.repository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(index);
        },
      );

      return index;
    }
  }

  /**
   * 删除实体
   * @param id 实体ID
   * @returns 被删除的实体
   */
  async delete(id: XIdType): Promise<Entity> {
    const entity = await this.repository.findOneBy({ id });
    return await this.repository.remove(entity);
  }

  /**
   * 设置分组查询
   * @param rep 查询构建器
   * @param group 分组字段
   * @returns 分组结果
   */
  private async setGroup(rep: SelectQueryBuilder<Entity>, group: string) {
    let result = [];
    if (group) {
      result = (
        await rep
          .groupBy(`entity.${group}`)
          .select([`entity.${group}`, `count(entity.${group}) as count`])
          .getRawMany()
      ).map((y) => {
        const mapTo = {};
        mapTo[group] = y[`entity_${group}`];
        mapTo['count'] = parseInt(y.count);
        return mapTo;
      });
    }
    return result;
  }

  /**
   * 设置排序条件
   * @param rep 查询构建器
   * @param sort 排序条件数组
   * @returns 查询构建器
   */
  private setSort(rep: SelectQueryBuilder<Entity>, sort: XSort[]) {
    if (sort && sort.length > 0) {
      rep = rep.orderBy(this.transformSort(sort));
    }
    return rep;
  }

  /**
   * 转换排序条件为TypeORM格式
   * @param sort 排序条件数组
   * @param entity 实体别名
   * @returns 处理后的排序对象
   */
  private transformSort(sort: XSort[], entity = 'entity'): any {
    const condition: { [prop: string]: 'ASC' | 'DESC' } = {};
    if (sort && sort.length > 0) {
      sort.forEach((x) => {
        const order: 'ASC' | 'DESC' = x.value.toString().toUpperCase() as 'ASC' | 'DESC';
        const field = x.field;
        if (entity !== '') {
          condition[`${entity}.${field}`] = order;
        } else {
          condition[`${field}`] = order;
        }
      });
    }
    return condition;
  }
}
