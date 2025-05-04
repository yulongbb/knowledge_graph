import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Article } from './article.entity';
import { TemplateRenderResponse } from './template.model';
import Handlebars from 'handlebars';
@Injectable()
export class ArticleService extends XRepositoryService<Article, XQuery> {
  constructor(
    @InjectRepository(Article)
    public readonly articlesRepository: Repository<Article>,
    private dataSource: DataSource,
  ) {
    super(articlesRepository, dataSource);
  }

  async renderTemplate(id: string): Promise<TemplateRenderResponse> {
    try {
      const entity: any = await this.articlesRepository.findOne({
        where: { id: Number(id) } });

      if (!entity?.content) {
        return {
          success: true,
          content: '',
          message: 'No template defined for this entity',
        };
      }

      const sanitizedTemplate = entity.content
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/(<h[1-6])/gi, '\n$1') // 确保标题标签前有换行
        .replace(/(<\/h[1-6]>)/gi, '$1\n') // 确保标题标签后有换行
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (match) => {
          return match
            .replace(/{{/g, '&#123;&#123;')
            .replace(/}}/g, '&#125;&#125;');
        })
        .replace(/(<[^>]+>)\s*{{/g, '$1 {{')
        .replace(/}}\s*(<[^>]+>)/g, '}} $1');

      // 编译模板
      let template;
      try {
        template = Handlebars.compile(sanitizedTemplate, {
          strict: false,
          noEscape: true,
        });
      } catch (compileError) {
        console.error('Template compilation failed:', compileError);
        return {
          success: false,
          error: 'Template compilation failed: ' + compileError.message,
        };
      }

      // 渲染内容
      let content;
      try {
        content = template(entity.content);
      } catch (renderError) {
        console.error('Template rendering failed:', renderError);
        return {
          success: false,
          error: 'Template rendering failed: ' + renderError.message,
        };
      }

      // 添加目录 ID
      let counter = 0;
      const contentWithIds = content.replace(
        /<h([1-6])[^>]*>(.*?)<\/h\1>/gi,
        (match, level, text) => {
          const id = `heading-${++counter}`;
          return `<h${level} id="${id}" class="section-heading">${text}</h${level}>`;
        },
      );

      // 添加样式
      const contentWithStyle = `
            <style>
              img {
                max-width: 100%;
                height: auto;
                margin: 1rem 0;
              }
              pre {
                background-color: #f6f8fa;
                padding: 1rem;
                border-radius: 6px;
                overflow-x: auto;
              }
              code {
                font-family: monospace;
              }
              h1, h2, h3, h4, h5, h6 {
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                scroll-margin-top: 70px;
              }
              .section-heading {
                position: relative;
              }
              .section-heading:target {
                color: #0366d6;
              }
            </style>
            ${contentWithIds}
          `;

      return {
        success: true,
        content: contentWithStyle,
      };
    } catch (error) {
      console.error('Template rendering failed:', error);
      return {
        success: false,
        error: 'Template processing failed: ' + error.message,
      };
    }
  }
}
