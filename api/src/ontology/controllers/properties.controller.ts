import { Controller, Get, Param, Query } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { Property } from 'src/ontology/entities/property.entity';
import { PropertiesService } from 'src/ontology/services/properties.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@Controller('properties')
@ApiTags('本体建模') // 分组
export class PropertiesController extends XControllerService<Property, XQuery> {
  constructor(public readonly propertiesService: PropertiesService) {
    super(propertiesService);
  }

  @Get('name/:name')
  async getPropertyByName(
    @Param('name') name: string,
    @Query('namespaceId') namespaceId?: string
  ): Promise<Property> {
    if (namespaceId) {
      return await this.propertiesService.getPropertyByNameAndNamespace(name, namespaceId);
    }
    return await this.propertiesService.getPropertyByName(name);
  }
  
  @Get('namespace/:namespaceId')
  async findAllByNamespace(@Param('namespaceId') namespaceId: string): Promise<Property[]> {
    return this.propertiesService.findAllByNamespace(namespaceId);
  }
}
