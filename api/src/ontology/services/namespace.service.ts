import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Namespace } from '../entities/namespace.entity';

@Injectable()
export class NamespaceService extends XRepositoryService<Namespace, XQuery> {
  constructor(
    @InjectRepository(Namespace)
    public readonly namespaceRepository: Repository<Namespace>,
    private dataSource: DataSource
  ) {
    super(namespaceRepository, dataSource);
  }

  async findByName(name: string): Promise<Namespace> {
    return this.namespaceRepository.findOne({ where: { name } });
  }

  async getDefault(): Promise<Namespace> {
    const defaultNamespace = await this.namespaceRepository.findOne({
      where: { name: 'default' }
    });

    if (!defaultNamespace) {
      // Create default namespace if it doesn't exist
      const namespace = new Namespace();
      namespace.name = 'default';
      namespace.description = 'Default namespace for ontology entities';
      namespace.prefix = 'def';
      return this.namespaceRepository.save(namespace);
    }

    return defaultNamespace;
  }

  async findByIds(ids: string[]): Promise<Namespace[]> {
    return this.namespaceRepository.findByIds(ids);
  }
}
