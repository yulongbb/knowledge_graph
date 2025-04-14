import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Addon } from './entities/addon.entity';

@Injectable()
export class AddonService {
  constructor(
    @InjectRepository(Addon)
    private readonly addonRepository: Repository<Addon>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  // 创建索引并为其添加别名
  private async createIndexWithAlias(addon: Addon): Promise<void> {
    const indexName = `entity_${addon.id}`;
    const aliasName = addon.name;

    // Create index
    await this.elasticsearchService.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            // 定义你的索引映射
          }
        }
      }
    });

    // Add alias
    await this.elasticsearchService.indices.putAlias({
      index: indexName,
      name: aliasName
    });
  }

  // 更新索引的别名
  private async updateIndexAlias(id: number, oldName: string, newName: string): Promise<void> {
    const indexName = `entity_${id}`;
    
    // Remove old alias
    await this.elasticsearchService.indices.deleteAlias({
      index: indexName,
      name: oldName
    });

    // Add new alias
    await this.elasticsearchService.indices.putAlias({
      index: indexName,
      name: newName
    });
  }

  // 获取所有插件
  async findAll(): Promise<Addon[]> {
    return this.addonRepository.find();
  }

  // 根据ID获取单个插件
  async findOne(id: number): Promise<Addon> {
    return this.addonRepository.findOne({ where: { id } });
  }

  // 创建新插件并创建对应的索引
  async create(addon: Addon): Promise<Addon> {
    const savedAddon = await this.addonRepository.save(addon);
    await this.createIndexWithAlias(savedAddon);
    return savedAddon;
  }

  // 更新插件信息并处理索引别名和固定状态
  async update(id: number, addon: Addon): Promise<Addon> {
    const oldAddon = await this.findOne(id);
    await this.addonRepository.update(id, addon);
    const updatedAddon = await this.addonRepository.findOne({ where: { id } });

    if (oldAddon.name !== updatedAddon.name) {
      await this.updateIndexAlias(id, oldAddon.name, updatedAddon.name);
    }

    // Handle pinning logic
    if (oldAddon.isPinned !== updatedAddon.isPinned) {
      updatedAddon.isPinned = addon.isPinned;
      await this.addonRepository.save(updatedAddon);
    }

    return updatedAddon;
  }

  // 删除插件
  async remove(id: number): Promise<void> {
    await this.addonRepository.delete(id);
  }

  // 获取所有插件类别
  async findCategories(): Promise<string[]> {
    const categories = await this.addonRepository
      .createQueryBuilder('addon')
      .select('DISTINCT addon.category')
      .getRawMany();
    return categories.map(category => category.category);
  }

  // 根据类别获取插件
  async findByCategory(category: string): Promise<Addon[]> {
    return this.addonRepository.find({ where: { category } });
  }

  // 获取所有固定的插件
  async findPinned(): Promise<Addon[]> {
    const pinnedExtensions = await this.addonRepository.find({ where: { isPinned: true } });
    console.log('Pinned Extensions:', pinnedExtensions); // Add this log for debugging
    return pinnedExtensions;
  }

  // 切换插件的固定状态
  async togglePin(id: number): Promise<void> {
    const addon = await this.findOne(id);
    addon.isPinned = !addon.isPinned;
    await this.addonRepository.save(addon);
  }

  // 为插件添加评分并更新平均评分
  async addRating(id: number, rating: number): Promise<Addon> {
    const addon = await this.findOne(id);
    
    if (!addon.userRatings) {
      addon.userRatings = [];
    }
    
    addon.userRatings.push(rating);
    addon.totalRatings++;
    
    // 计算新的平均评分
    addon.rating = addon.userRatings.reduce((a, b) => a + b, 0) / addon.totalRatings;
    
    return this.addonRepository.save(addon);
  }
}
