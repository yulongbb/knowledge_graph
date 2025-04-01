import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ThreeDModel } from './3d-model.entity';
import { MinioClientService } from '../minio/minio-client.service';
import { CreateModelDto, UpdateModelDto, SearchModelDto } from './dto/3d-model.dto';

@Injectable()
export class ThreeDModelService {
  constructor(
    @InjectRepository(ThreeDModel)
    private modelRepository: Repository<ThreeDModel>,
    private minioService: MinioClientService
  ) {}

  async create(file: Express.Multer.File, createModelDto: CreateModelDto): Promise<ThreeDModel> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // 验证文件格式
      const validFormats = ['glb', 'gltf', 'fbx'];
      const fileFormat = file.originalname.split('.').pop()?.toLowerCase();
      console.log('File format:', fileFormat, 'Original name:', file.originalname);
      
      if (!fileFormat || !validFormats.includes(fileFormat)) {
        console.log('Invalid format detected:', fileFormat);
        console.log('Valid formats:', validFormats);
        throw new BadRequestException(`Invalid file format: ${fileFormat}. Only .glb, .gltf and .fbx files are allowed.`);
      }

      // 上传文件到 MinIO
      const uploadResult:any = await this.minioService.upload(file, '3d-models');
      
      // 创建模型记录
      const model = this.modelRepository.create({
        ...createModelDto,
        filePath: uploadResult.name,
        format: fileFormat,
        fileSize: file.size,
        previewUrl: uploadResult.name, // 简化预览URL
        searchableText: `${createModelDto.name} ${createModelDto.description} ${createModelDto.tags.join(' ')}`
      });

      return this.modelRepository.save(model);
    } catch (error) {
      console.error('Upload error details:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to upload model');
    }
  }

  async findAll(): Promise<ThreeDModel[]> {
    return this.modelRepository.find();
  }

  async search(searchDto: SearchModelDto): Promise<ThreeDModel[]> {
    const query = this.modelRepository.createQueryBuilder('model');

    if (searchDto.search) {
      query.where('model.searchableText LIKE :search', { search: `%${searchDto.search}%` });
    }

    if (searchDto.category) {
      query.andWhere('model.category = :category', { category: searchDto.category });
    }

    if (searchDto.tags?.length) {
      query.andWhere('model.tags && :tags', { tags: searchDto.tags });
    }

    return query.getMany();
  }

  async update(id: string, updateModelDto: UpdateModelDto): Promise<ThreeDModel> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    Object.assign(model, updateModelDto);
    model.searchableText = `${model.name} ${model.description} ${model.tags.join(' ')}`;

    return this.modelRepository.save(model);
  }

  async delete(id: string): Promise<void> {
    const model = await this.modelRepository.findOne({ where: { id } });
    if (!model) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    // 删除MinIO中的文件
    await this.minioService.deleteFile(model.filePath, '3d-models');
    
    await this.modelRepository.remove(model);
  }

  async getTags(): Promise<string[]> {
    const models = await this.modelRepository.find();
    const tagsSet = new Set<string>();
    models.forEach(model => {
      model.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.modelRepository
      .createQueryBuilder('model')
      .select('DISTINCT model.category')
      .getRawMany();
    return categories.map(c => c.category);
  }
}
