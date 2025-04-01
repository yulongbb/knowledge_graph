import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThreeDModelService } from './3d-model.service';
import { CreateModelDto, UpdateModelDto, SearchModelDto } from './dto/3d-model.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('3D Models')
@Controller('3d-models')
export class ThreeDModelController {
  private readonly logger = new Logger(ThreeDModelController.name);

  constructor(private readonly modelService: ThreeDModelService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024, // 增加到100MB，因为fbx文件通常较大
      },
      fileFilter: (req, file, callback) => {
        const validFormats = ['.glb', '.gltf', '.fbx'];
        const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
        if (!validFormats.includes(ext)) {
          return callback(new BadRequestException('Only .glb, .gltf and .fbx files are allowed'), false);
        }
        callback(null, true);
      }
    })
  )
  @ApiOperation({ summary: '上传3D模型' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    try {
      this.logger.log(`Processing file upload: ${file?.originalname}`);
      console.log('Received file:', file?.originalname);
      console.log('Received metadata:', body.metadata);

      const metadata = typeof body.metadata === 'string' 
        ? JSON.parse(body.metadata)
        : body.metadata;

      const createModelDto: CreateModelDto = {
        name: metadata.name,
        description: metadata.description || '',
        category: metadata.category || 'Other',
        tags: metadata.tags || []
      };
      
      return await this.modelService.create(file, createModelDto);
    } catch (error) {
      this.logger.error('Upload error:', error);
      console.error('Upload error:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: '获取所有模型' })
  async findAll() {
    return this.modelService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: '搜索模型' })
  async search(@Query() searchDto: SearchModelDto) {
    return this.modelService.search(searchDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新模型信息' })
  async update(@Param('id') id: string, @Body() updateModelDto: UpdateModelDto) {
    return this.modelService.update(id, updateModelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模型' })
  async delete(@Param('id') id: string) {
    return this.modelService.delete(id);
  }

  @Get('tags')
  @ApiOperation({ summary: '获取所有标签' })
  async getTags() {
    return this.modelService.getTags();
  }

  @Get('categories')
  @ApiOperation({ summary: '获取所有分类' })
  async getCategories() {
    return this.modelService.getCategories();
  }
}
