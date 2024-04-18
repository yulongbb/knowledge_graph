import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Property } from 'src/ontology/entities/property.entity';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('properties')
@ApiTags('本体建模') // 分组
export class PropertiesController extends XControllerService<Property, XQuery> {
  constructor(public readonly propertiesService: PropertiesService) {
    super(propertiesService);
  }

  @Get(':name')
  getPropertyByName(@Param('name') name: string): any {
    return this.propertiesService.getPropertyByName(name);
  }
}
