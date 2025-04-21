import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Action } from './entities/action.entity';

@Injectable()
export class ActionsService extends XRepositoryService<Action, XQuery> {
  /**
   * 操作权限服务构造函数
   * @param entityRepository 操作权限仓库
   * @param dataSource 数据源
   */
  constructor(
    @InjectRepository(Action)
    private readonly entityRepository: Repository<Action>,
    private dataSource: DataSource
  ) {
    super(entityRepository, dataSource);
  }
}
