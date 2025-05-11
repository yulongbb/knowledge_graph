import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { XControllerService, XQuery } from '@ng-nest/api/core';
import { ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApplicationsService } from '../services/applications.service';
import { Application } from '../entities/application.entity';
import { NamespaceService } from '../services/namespace.service';

@Controller('addons')
@ApiTags('应用管理') // 分组名称更改为应用管理
export class ApplicationsController extends XControllerService<Application, XQuery> {
  constructor(
    public readonly applicationsService: ApplicationsService,
    private namespaceService: NamespaceService // 注入命名空间服务
  ) {
    super(applicationsService);
  }

  // 获取所有应用
  @Get()
  async findAll(): Promise<Application[]> {
    return this.applicationsService.findAll();
  }

  // 获取所有置顶应用
  @Get('pinned')
  async findPinned(): Promise<Application[]> {
    return this.applicationsService.findPinned();
  }

  // 获取所有分类
  @Get('categories')
  async findAllCategories(): Promise<string[]> {
    return this.applicationsService.findAllCategories();
  }

  // 按分类查找应用
  @Get('category/:category')
  async findByCategory(@Param('category') category: string): Promise<Application[]> {
    return this.applicationsService.findAllByCategory(category);
  }
  
  // 上传单个图片
  @Post('upload-screenshot')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: file.path };
  }

  // 上传多个图片
  @Post('upload-screenshots')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    return { urls: files.map(file => file.path) };
  }

  // 为应用评分
  @Post(':id/rate')
  async rateApp(@Param('id') id: number, @Body() data: { rating: number }): Promise<Application> {
    return this.applicationsService.rateApplication(id, data.rating);
  }

  @Put(':id')
  async updateApplication(
    @Param('id') id: number,
    @Body() data: Partial<Application>
  ): Promise<Application> {
    const application = await this.applicationsService.get(id);
    if (!application) {
      throw new Error('Application not found');
    }

    // 处理关联命名空间
    if (data.namespaces) {
      const namespaceIds = Array.isArray(data.namespaces)
        ? data.namespaces.map((ns) => (typeof ns === 'object' ? ns.id : ns))
        : [data.namespaces];

      const namespaces = await this.namespaceService.findByIds(namespaceIds);
      application.namespaces = namespaces;
    }

    Object.assign(application, data);
    return this.applicationsService.saveApplication(application); // 使用 saveApplication 方法
  }
}
