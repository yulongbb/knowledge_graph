import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Controller('projects')
@ApiTags('项目管理')
export class ProjectController extends XControllerService<Project, XQuery> {
  constructor(public readonly projectService: ProjectService) {
    super(projectService);
  }
}
