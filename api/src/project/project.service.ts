import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  findOne(id: string): Promise<Project> {
    return this.projectRepository.findOne({ where: { id } });
  }

  async create(project: Partial<Project>): Promise<Project> {
    const newProject = this.projectRepository.create(project);
    return this.projectRepository.save(newProject);
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    await this.projectRepository.update(id, project);
    return this.projectRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
