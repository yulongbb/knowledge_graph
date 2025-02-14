import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { AddonService } from './addon.service';
import { Addon } from './entities/addon.entity';

@Controller('addons')
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Get()
  findAll(@Query('category') category?: string): Promise<Addon[]> {
    if (category) {
      return this.addonService.findByCategory(category);
    }
    return this.addonService.findAll();
  }

  @Get('categories')
  findCategories(): Promise<string[]> {
    return this.addonService.findCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Addon> {
    return this.addonService.findOne(id);
  }

  @Post()
  create(@Body() addon: Addon): Promise<Addon> {
    return this.addonService.create(addon);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() addon: Addon): Promise<Addon> {
    return this.addonService.update(id, addon);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.addonService.remove(id);
  }
}
