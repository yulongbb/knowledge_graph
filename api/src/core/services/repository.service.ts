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

@Injectable()
export class XRepositoryService<Entity extends XId, Query extends XQuery> {
  constructor(
    private repository: Repository<Entity>,
    private dataSouce: DataSource,
  ) {}

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
  private setFilter(rep: SelectQueryBuilder<Entity>, filter: XFilter[]) {
    if (filter && filter.length > 0) {
      const param = {};
      filter.forEach((x, index) => {
        param[`param${index}`] = x.value;
        if (x.relation) {
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
              // '%'
              rep.andWhere(`entity.${x.field} LIKE concat('%', :param${index}, '%')`);
              break;
          }
        }
      });
      rep.setParameters(param);
    }
  }

  async get(id: XIdType): Promise<Entity> {
    return await this.repository.findOneBy({ id });
  }

  async post(entity: any): Promise<Entity> {
    return await this.repository.save(entity);
  }

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

  async delete(id: XIdType): Promise<Entity> {
    const entity = await this.repository.findOneBy({ id });
    return await this.repository.remove(entity);
  }

  

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

  private setSort(rep: SelectQueryBuilder<Entity>, sort: XSort[]) {
    if (sort && sort.length > 0) {
      rep = rep.orderBy(this.transformSort(sort));
    }
    return rep;
  }

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
