import { Controller } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags } from '@nestjs/swagger';
import { Type } from '../entities/type.entity';
import { TypesService } from '../services/types.service';

@Controller('types')
@ApiTags('本体建模') // 分组
export class TypesController extends XControllerService<Type, XQuery> {
  constructor(public readonly typesService: TypesService) {
    super(typesService);
  }
}
