import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { DataSource, Repository } from 'typeorm';
import { Control } from '../entities/control.entity';

@Injectable()
export class ControlService extends XRepositoryService<Control, XQuery> {
  constructor(
    @InjectRepository(Control)
    private readonly entityRepository: Repository<Control>,
    private dataSource: DataSource
  ) {
    super(entityRepository, dataSource);
  }
}
