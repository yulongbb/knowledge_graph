import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { NamespaceService } from '../services/namespace.service';
import { Namespace } from '../entities/namespace.entity';

@Controller('namespaces')
@ApiTags('命名空间')
export class NamespaceController extends XControllerService<Namespace, XQuery> {
  constructor(public readonly namespaceService: NamespaceService) {
    super(namespaceService);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string): Promise<Namespace> {
    return this.namespaceService.findByName(name);
  }
}
