import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from '../services/applications.service';
import { Application } from '../entities/application.entity';

@Controller('applications')
@ApiTags('标签管理') // 分组
export class ApplicationsController extends XControllerService<Application, XQuery> {
  constructor(public readonly applicationsService: ApplicationsService) {
    super(applicationsService);
  }

}
