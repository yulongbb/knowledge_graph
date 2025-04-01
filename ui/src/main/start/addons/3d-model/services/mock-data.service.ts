import { Injectable } from '@angular/core';
import { CharacterModel } from '../models/character-model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockCharacters: CharacterModel[] = [
    {
      id: '1',
      name: 'Walking Robot',
      description: 'A humanoid robot character with walking animation',
      filePath: '/assets/models/robot.glb',
      thumbnailUrl: '/assets/thumbnails/robot.jpg',
      previewUrl: '/assets/models/robot.glb',
      tags: ['robot', 'animation', 'humanoid'],
      category: 'Characters',
      format: 'glb',
      fileSize: 2048576,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: '2',
      name: 'Sci-fi Drone',
      description: 'Futuristic surveillance drone model',
      filePath: '/assets/models/drone.glb',
      thumbnailUrl: '/assets/thumbnails/drone.jpg',
      previewUrl: '/assets/models/drone.glb',
      tags: ['drone', 'sci-fi', 'vehicle'],
      category: 'Vehicles',
      format: 'glb',
      fileSize: 1048576,
      createdAt: new Date('2024-03-02'),
      updatedAt: new Date('2024-03-02')
    },
    {
      id: '3',
      name: 'Fantasy Sword',
      description: 'Detailed medieval fantasy sword with ornate decorations',
      filePath: '/assets/models/sword.glb',
      thumbnailUrl: '/assets/thumbnails/sword.jpg',
      previewUrl: '/assets/models/sword.glb',
      tags: ['weapon', 'medieval', 'fantasy'],
      category: 'Props',
      format: 'glb',
      fileSize: 1548576,
      createdAt: new Date('2024-03-03'),
      updatedAt: new Date('2024-03-03')
    },
    {
      id: '4',
      name: 'Ancient Temple',
      description: 'Ruins of an ancient temple with detailed architecture',
      filePath: '/assets/models/temple.glb',
      thumbnailUrl: '/assets/thumbnails/temple.jpg',
      previewUrl: '/assets/models/temple.glb',
      tags: ['architecture', 'ancient', 'ruins'],
      category: 'Environment',
      format: 'glb',
      fileSize: 5048576,
      createdAt: new Date('2024-03-04'),
      updatedAt: new Date('2024-03-04')
    }
  ];

  private mockCategories = ['Characters', 'Vehicles', 'Props', 'Environment', 'Weapons', 'Architecture'];
  private mockTags = [
    'robot', 'animation', 'humanoid', 'drone', 'sci-fi', 'vehicle',
    'weapon', 'medieval', 'fantasy', 'architecture', 'ancient', 'ruins',
    'character', 'prop', 'environment', 'mechanical', 'organic'
  ];

  getMockCharacters(): CharacterModel[] {
    return this.mockCharacters;
  }

  getMockCategories(): string[] {
    return this.mockCategories;
  }

  getMockTags(): string[] {
    return this.mockTags;
  }
}
