import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { Dataset } from './dataset.entity';
import { DatasetService } from './dataset.service';

@Controller('dataset')
@ApiTags('标签管理') // 分组
export class DatasetController extends XControllerService<Dataset, XQuery> {
  constructor(public readonly datasetsService: DatasetService) {
    super(datasetsService);
  }

}