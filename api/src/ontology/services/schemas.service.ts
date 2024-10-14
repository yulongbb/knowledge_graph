import { Injectable } from '@nestjs/common';
import { Repository, Like, DataSource } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Schema } from 'src/ontology/entities/schema.entity';
import { orderBy } from 'lodash';
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

  async getParent(schemaId: string): Promise<string[]> {
    const parentIds: string[] = [];
    await this.getParentIdsRecursively(schemaId, parentIds);
    return parentIds;
  }


  async getChildren(schemaId: string): Promise<string[]> {
    const children: any = [];
    await this.getChildrenIdsRecursively(schemaId, children);
    return children;
  }

  private async getChildrenIdsRecursively(schemaId: string, children: any): Promise<void> {
    const schema: any = await this.schemasRepository.findOne({
      where: { id: schemaId },
      relations: ['children'],
    });
    if (schema.children) {
      for (const child of schema.children) {
        children.push(child);
        await this.getChildrenIdsRecursively(child.id, children);
      }
    }
  }

  private async getParentIdsRecursively(schemaId: string, parentIds: string[]): Promise<void> {
    const schema = await this.schemasRepository.findOne({
      where: { id: schemaId },
      relations: ['parent'],
    });

    if (schema?.parent) {
      parentIds.push(schema.parent.id);
      await this.getParentIdsRecursively(schema.parent.id, parentIds);
    }
  }

  async get(id: XIdType): Promise<Schema> {
    return await this.schemasRepository.findOneBy({ id: id });
  }

  async post(entity: Schema): Promise<Schema> {
    console.log(entity);
    let parent = null;
    if (entity.pid !== null)
      parent = await this.schemasRepository.findOneBy({ pid: entity.pid });
    return await this.schemasRepository.manager.transaction<Schema>(
      async () => {
        entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`;
        const result = await this.schemasRepository.save(entity);
        return result;
      },
    );
  }

  async put(entity: Schema): Promise<Schema> {
    const schema = await this.schemasRepository.findOne({
      where: { id: entity.id },
      relations: ['properties'],
    });
    if (schema) {
      return await this.schemasRepository.manager.transaction(async () => {
        Object.assign(schema, entity);
        const result = await this.schemasRepository.save(schema);
        return result;
      });
    }
  }

  async delete(id: XIdType): Promise<Schema> {
    const remove = await this.schemasRepository.findOneBy({ id });
    let moves = await this.schemasRepository.find({
      where: { path: Like(`${remove.path}%`) },
    });
    moves = orderBy(moves, (x) => -x.path.length);
    for (const move of moves) {
      await this.schemasRepository.remove(move);
    }
    return remove;
  }
}
