import { Controller, UseGuards } from '@nestjs/common';
import { Table } from '../entities/table.entity';
import { TableService } from '../services/table.service';
import { AuthGuard } from '@nestjs/passport';
import { XQuery } from 'src/core/interfaces';
import { XControllerService } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';

@Controller('tables')
@UseGuards(AuthGuard('jwt'))
@ApiTags('页面设计') // 分组
export class TableController extends XControllerService<Table, XQuery> {
  constructor(private readonly entityService: TableService) {
    super(entityService);
  }
}
