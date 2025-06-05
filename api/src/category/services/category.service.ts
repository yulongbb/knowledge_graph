import { Injectable } from '@nestjs/common';
import { Repository, Like, DataSource } from 'typeorm';
import { XRepositoryService, XQuery, XIdType } from '@ng-nest/api/core';
import { Category } from '../entities/category.entity';
import { orderBy } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService extends XRepositoryService<Category, XQuery> {
  constructor(
    @InjectRepository(Category)
    public readonly categoryRepository: Repository<Category>,
    private dataSource: DataSource,
  ) {
    super(categoryRepository, dataSource);
  }

  async getParent(categoryId: string): Promise<string[]> {
    const parentIds: string[] = [];
    await this.getParentIdsRecursively(categoryId, parentIds);
    return parentIds;
  }

  async getByName(name: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ name });
    return category;
  }

  async getChildren(categoryId: string): Promise<any[]> {
    const children: any = [];
    await this.getChildrenIdsRecursively(categoryId, children);
    return children;
  }

  private async getChildrenIdsRecursively(categoryId: string, children: any[]): Promise<void> {
    const category: any = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['children'],
    });
    if (category?.children) {
      for (const child of category.children) {
        children.push(child);
        await this.getChildrenIdsRecursively(child.id, children);
      }
    }
  }

  private async getParentIdsRecursively(categoryId: string, parentIds: string[]): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    });

    if (category?.parent) {
      parentIds.push(category.parent.id);
      await this.getParentIdsRecursively(category.parent.id, parentIds);
    }
  }

  async get(id: XIdType): Promise<Category> {
    return await this.categoryRepository.findOneBy({ id: id });
  }

  async post(entity: Category): Promise<Category> {
    let parent = null;
    if (entity.pid !== null)
      parent = await this.categoryRepository.findOneBy({ id: entity.pid });
    return await this.categoryRepository.manager.transaction<Category>(
      async () => {
        entity.path = parent ? `${parent.path}.${entity.id}` : `${entity.id}`;
        const result = await this.categoryRepository.save(entity);
        return result;
      },
    );
  }

  async put(entity: Category): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id: entity.id });
    if (category) {
      return await this.categoryRepository.manager.transaction(async () => {
        Object.assign(category, entity);
        const result = await this.categoryRepository.save(category);
        return result;
      });
    }
    return null;
  }

  async delete(id: XIdType): Promise<Category> {
    const remove = await this.categoryRepository.findOneBy({ id });
    let moves = await this.categoryRepository.find({
      where: { path: Like(`${remove.path}%`) },
    });
    moves = orderBy(moves, (x) => -x.path.length);
    for (const move of moves) {
      await this.categoryRepository.remove(move);
    }
    return remove;
  }
}
