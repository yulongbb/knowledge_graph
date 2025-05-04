import { Controller, Get, Param } from '@nestjs/common';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { TemplateRenderResponse } from './template.model';

@Controller('article')
@ApiTags('文章管理')
export class ArticleController extends XControllerService<Article, XQuery> {
  constructor(public readonly articlesService: ArticleService) {
    super(articlesService);
  }

  @Get('render/:id')
  @ApiOperation({
    summary: '渲染知识模板',
    description: '使用Handlebars渲染知识实体的模板，生成HTML内容',
  })
  @ApiParam({ name: 'id', description: '知识实体的唯一标识' })
  @ApiResponse({
    status: 200,
    description: '渲染后的HTML内容',
    type: TemplateRenderResponse,
  })
  async renderTemplate(
    @Param('id') id: string,
  ): Promise<TemplateRenderResponse> {
    try {
      const result = await this.articlesService.renderTemplate(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }
}
