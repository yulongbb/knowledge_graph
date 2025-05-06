import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Project } from './project.entity';

@Injectable()
export class ProjectService extends XRepositoryService<Project, XQuery> {
  constructor(
    @InjectRepository(Project)
    public readonly projectRepository: Repository<Project>,
    private dataSource: DataSource
  ) {
    super(projectRepository, dataSource);
  }
}