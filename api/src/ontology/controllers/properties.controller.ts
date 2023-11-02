import { Controller, UseGuards } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { AuthGuard } from '@nestjs/passport';
import { Property } from 'src/ontology/entities/property.entity';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { ApiTags } from '@nestjs/swagger';


@Controller('properties')
@UseGuards(AuthGuard('jwt'))
@ApiTags('本体建模') // 分组
export class PropertiesController extends XControllerService<Property, XQuery> {
  constructor(public readonly propertiesService: PropertiesService) {
    super(propertiesService);
  }
}
