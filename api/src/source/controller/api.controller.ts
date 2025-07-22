import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { ApiEntity } from '../entities/api.entity';
import { ApiService } from '../services/api.service';

@Controller('api-interface')
@ApiTags('数据接口管理')
export class ApiController extends XControllerService<ApiEntity, XQuery> {
  constructor(public readonly apiService: ApiService) {
    super(apiService);
  }
}
