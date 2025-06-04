import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { XRepositoryService, XQuery } from '@ng-nest/api/core';
import { Application } from '../entities/application.entity';

@Injectable()
export class ApplicationsService extends XRepositoryService<Application, XQuery> {

    constructor(
        @InjectRepository(Application)
        public readonly applicationsRepository: Repository<Application>,
        private dataSource: DataSource
    ) {
        super(applicationsRepository, dataSource);
    }

    async findPinned(): Promise<Application[]> {
        return this.applicationsRepository.find({
            where: { isPinned: true }
        });
    }

    async findAllByCategory(category: string): Promise<Application[]> {
        if (category === '全部') {
            return this.applicationsRepository.find();
        }
        return this.applicationsRepository.find({
            where: { category }
        });
    }

    async findAllCategories(): Promise<string[]> {
        const applications = await this.applicationsRepository.find({
            select: ['category']
        });
        
        // 提取去重后的分类列表
        const categories = new Set<string>();
        applications.forEach(app => {
            if (app.category) {
                categories.add(app.category);
            }
        });
        
        return Array.from(categories);
    }

    async rateApplication(id: number, rating: number): Promise<Application> {
        const application = await this.applicationsRepository.findOneBy({ id });
        if (!application) {
            throw new Error('Application not found');
        }

        // 初始化评分数组（如果不存在）
        if (!application.userRatings) {
            application.userRatings = [];
        }

        // 添加新评分
        application.userRatings.push(rating);
        
        // 更新总评分人数
        application.totalRatings = application.userRatings.length;
        
        // 计算平均评分
        const sum = application.userRatings.reduce((acc, val) => acc + val, 0);
        application.rating = sum / application.userRatings.length;
        
        // 更新评论数（在这个简单模型中等同于评分数）
        application.reviews = application.totalRatings;

        return this.applicationsRepository.save(application);
    }

    async findAll(): Promise<Application[]> {
        return this.applicationsRepository.find();
    }

    // 添加保存方法
    async saveApplication(application: Application): Promise<Application> {
        return this.applicationsRepository.save(application);
    }
}