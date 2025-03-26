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

  async findAll(): Promise<Addon[]> {
    return this.addonRepository.find();
  }

  async findOne(id: number): Promise<Addon> {
    return this.addonRepository.findOne({ where: { id } });
  }

  async create(addon: Addon): Promise<Addon> {
    const savedAddon = await this.addonRepository.save(addon);
    await this.createIndexWithAlias(savedAddon);
    return savedAddon;
  }

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

  async remove(id: number): Promise<void> {
    await this.addonRepository.delete(id);
  }

  async findCategories(): Promise<string[]> {
    const categories = await this.addonRepository
      .createQueryBuilder('addon')
      .select('DISTINCT addon.category')
      .getRawMany();
    return categories.map(category => category.category);
  }

  async findByCategory(category: string): Promise<Addon[]> {
    return this.addonRepository.find({ where: { category } });
  }

  async findPinned(): Promise<Addon[]> {
    const pinnedExtensions = await this.addonRepository.find({ where: { isPinned: true } });
    console.log('Pinned Extensions:', pinnedExtensions); // Add this log for debugging
    return pinnedExtensions;
  }

  async togglePin(id: number): Promise<void> {
    const addon = await this.findOne(id);
    addon.isPinned = !addon.isPinned;
    await this.addonRepository.save(addon);
  }

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
