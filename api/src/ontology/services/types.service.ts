import { Injectable } from '@nestjs/common';
import { Repository, Like, DataSource } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { orderBy } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from '../entities/type.entity';

@Injectable()
export class TypesService extends XRepositoryService<Type, XQuery> {
  constructor(
    @InjectRepository(Type)
    public readonly typesRepository: Repository<Type>,
    private dataSource: DataSource,
  ) {
    super(typesRepository, dataSource);
  }

  async get(id: XIdType): Promise<Type> {
    return await this.typesRepository.findOneBy({ id: id });
  }

  async post(entity: Type): Promise<Type> {
    console.log(entity);
    let parent = null;
    if (entity.pid !== null)
      parent = await this.typesRepository.findOneBy({ pid: entity.pid });
    return await this.typesRepository.manager.transaction<Type>(
      async () => {
        entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`;
        const result = await this.typesRepository.save(entity);
        return result;
      },
    );
  }

  async put(entity: Type): Promise<Type> {
    const type = await this.typesRepository.findOne({
      where: { id: entity.id },
      relations: ['properties'],
    });
    if (type) {
      return await this.typesRepository.manager.transaction(async () => {
        Object.assign(type, entity);
        const result = await this.typesRepository.save(type);
        return result;
      });
    }
  }

  async delete(id: XIdType): Promise<Type> {
    const remove = await this.typesRepository.findOneBy({ id });
    let moves = await this.typesRepository.find({
      where: { path: Like(`${remove.path}%`) },
    });
    moves = orderBy(moves, (x) => -x.path.length);
    for (const move of moves) {
      await this.typesRepository.remove(move);
    }
    return remove;
  }
}
