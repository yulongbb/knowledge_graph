import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Addon } from './entities/addon.entity';

@Injectable()
export class AddonService {
  constructor(
    @InjectRepository(Addon)
    private readonly addonRepository: Repository<Addon>,
  ) {}

  findAll(): Promise<Addon[]> {
    return this.addonRepository.find();
  }

  findOne(id: number): Promise<Addon> {
    return this.addonRepository.findOne({ where: { id } });
  }

  create(addon: Addon): Promise<Addon> {
    return this.addonRepository.save(addon);
  }

  async update(id: number, addon: Addon): Promise<Addon> {
    await this.addonRepository.update(id, addon);
    return this.addonRepository.findOne({ where: { id } });
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

  findByCategory(category: string): Promise<Addon[]> {
    return this.addonRepository.find({ where: { category } });
  }
}
