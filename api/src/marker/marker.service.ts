import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marker } from './marker.entity';

@Injectable()
export class MarkerService {
  constructor(
    @InjectRepository(Marker)
    private markerRepository: Repository<Marker>,
  ) {}

  async create(markerData: Partial<Marker>): Promise<Marker> {
    const marker = this.markerRepository.create(markerData);
    return this.markerRepository.save(marker);
  }

  async findAll(): Promise<Marker[]> {
    return this.markerRepository.find();
  }

  async remove(id: number): Promise<void> {
    await this.markerRepository.delete(id);
  }
}
