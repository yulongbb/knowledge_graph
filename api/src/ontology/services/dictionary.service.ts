import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from '../entities/dictionary.entity';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>
  ) {}

  async findAll(): Promise<Dictionary[]> {
    return this.dictionaryRepository.find();
  }

  async findByPropertyId(propertyId: string): Promise<Dictionary[]> {
    return this.dictionaryRepository.find({
      where: { propertyId }
    });
  }

  async create(dictionary: Dictionary): Promise<Dictionary> {
    return this.dictionaryRepository.save(dictionary);
  }

  async update(id: string, dictionary: Dictionary): Promise<Dictionary> {
    await this.dictionaryRepository.update(id, dictionary);
    return this.dictionaryRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.dictionaryRepository.delete(id);
  }
}
