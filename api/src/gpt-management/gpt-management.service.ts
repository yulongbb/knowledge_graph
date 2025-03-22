import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GptModel } from './entities/gpt-model.entity';

@Injectable()
export class GptManagementService {
  constructor(
    @InjectRepository(GptModel)
    private gptModelRepository: Repository<GptModel>,
  ) {}

  async findAll(): Promise<GptModel[]> {
    return this.gptModelRepository.find();
  }

  async findOne(id: number): Promise<GptModel> {
    return this.gptModelRepository.findOne({ where: { id } });
  }

  async create(gptModel: Partial<GptModel>): Promise<GptModel> {
    const newModel = this.gptModelRepository.create(gptModel);
    return this.gptModelRepository.save(newModel);
  }

  async update(id: number, gptModel: Partial<GptModel>): Promise<GptModel> {
    await this.gptModelRepository.update(id, gptModel);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.gptModelRepository.delete(id);
  }
}
