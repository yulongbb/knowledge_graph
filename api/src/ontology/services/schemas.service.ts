import { Injectable } from '@nestjs/common';
import { Repository, getManager, Like, DataSource } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Schema } from 'src/ontology/entities/schema.entity';
import { filter, find, orderBy } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SchemasService extends XRepositoryService<Schema, XQuery> {
  constructor(
    @InjectRepository(Schema)
    public readonly schemasRepository: Repository<Schema>,
    private dataSource: DataSource,
  ) {
    super(schemasRepository, dataSource);
  }

  async get(id: XIdType): Promise<Schema> {
    return await this.schemasRepository.findOneBy({ id: id });
  }

  async post(entity: Schema): Promise<Schema> {
    console.log(entity);
    let parent = null;
    if (entity.pid !== null)
      parent = await this.schemasRepository.findOneBy({ pid: entity.pid });
    return await this.schemasRepository.manager.transaction<Schema>(async x => {
      entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`;
      let result = await this.schemasRepository.save(entity);
      return result;
    });
  }

  async put(entity: Schema): Promise<Schema> {
    let schema = await this.schemasRepository.findOne({
      where: { id: entity.id },
      relations: ['actions'],
    });
    if (schema) {
      return await this.schemasRepository.manager.transaction(async x => {
        Object.assign(schema, entity);
        let result = await this.schemasRepository.save(schema);
        return result;
      });
    }
  }

  async delete(id: XIdType): Promise<Schema> {
    let remove = await this.schemasRepository.findOneBy({ id });
    let moves = await this.schemasRepository.find({
      where: { path: Like(`${remove.path}%`) },
    });
    moves = orderBy(moves, x => -x.path.length);
    for (let move of moves) {
      await this.schemasRepository.remove(move);
    }
    return remove;
  }
}
