import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XIdType, XQuery } from '@ng-nest/api/core';
import { Category } from '../entities/category.entity';
import { CategoryService } from '../services/category.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('categories')
@ApiTags('分类管理')
export class CategoryController extends XControllerService<Category, XQuery> {
  constructor(public readonly categoryService: CategoryService) {
    super(categoryService);
  }

  @Get('children/:id')
  getChildren(@Param('id') id: XIdType): any {
    return this.categoryService.getChildren(id);
  }

  @Get('parent/:id')
  getParent(@Param('id') id: XIdType): any {
    return this.categoryService.getParent(id);
  }
  
  @Get('name/:name')
  async getCategoryByName(@Param('name') name: string): Promise<Category> {
    return await this.categoryService.getByName(name);
  }
}
