import { Controller, Get, Post, Put, Delete, Param, Body, Query, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { AddonService } from './addon.service';
import { Addon } from './entities/addon.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('插件管理') // 添加Swagger标签
@Controller('addons')
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Get()
  @ApiOperation({ summary: '获取所有插件或按类别筛选插件' })
  @ApiQuery({ name: 'category', required: false, description: '插件类别' })
  findAll(@Query('category') category?: string): Promise<Addon[]> {
    if (category) {
      return this.addonService.findByCategory(category);
    }
    return this.addonService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: '获取所有插件类别' })
  findCategories(): Promise<string[]> {
    return this.addonService.findCategories();
  }

  @Get('pinned')
  @ApiOperation({ summary: '获取所有固定的插件' })
  findPinned(): Promise<Addon[]> {
    return this.addonService.findPinned();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取插件' })
  @ApiParam({ name: 'id', description: '插件ID' })
  findOne(@Param('id') id: number): Promise<Addon> {
    return this.addonService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建新插件' })
  @ApiBody({ type: Addon, description: '插件数据' })
  create(@Body() addon: Addon): Promise<Addon> {
    return this.addonService.create(addon);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新插件信息' })
  @ApiParam({ name: 'id', description: '插件ID' })
  @ApiBody({ type: Addon, description: '更新后的插件数据' })
  update(@Param('id') id: number, @Body() addon: Addon): Promise<Addon> {
    return this.addonService.update(id, addon);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除插件' })
  @ApiParam({ name: 'id', description: '插件ID' })
  remove(@Param('id') id: number): Promise<void> {
    return this.addonService.remove(id);
  }

  @Post(':id/pin')
  @ApiOperation({ summary: '切换插件的固定状态' })
  @ApiParam({ name: 'id', description: '插件ID' })
  togglePin(@Param('id') id: number): Promise<void> {
    return this.addonService.togglePin(id);
  }

  @Post('upload-screenshot')
  @ApiOperation({ summary: '上传单个截图' })
  uploadScreenshot(@UploadedFile() file: Express.Multer.File): { url: string } {
    // Simulate saving the file and returning its URL
    const url = `/uploads/${file.filename}`;
    return { url };
  }

  @Post('upload-screenshots')
  @ApiOperation({ summary: '上传多个截图' })
  async uploadScreenshots(@UploadedFiles() files: Array<Express.Multer.File>): Promise<{ urls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Save files and generate URLs
    const urls = files.map(file => `/uploads/${file.filename}`);
    return { urls };
  }

  @Post(':id/rate')
  @ApiOperation({ summary: '为插件评分' })
  @ApiParam({ name: 'id', description: '插件ID' })
  @ApiBody({ schema: { properties: { rating: { type: 'number', description: '评分值' } } } })
  async rateAddon(
    @Param('id') id: number,
    @Body() data: { rating: number }
  ): Promise<Addon> {
    return this.addonService.addRating(id, data.rating);
  }
}
