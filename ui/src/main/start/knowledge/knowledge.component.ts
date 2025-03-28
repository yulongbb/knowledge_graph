import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from './models/category.model';
import { CategoryService } from './services/category.service';
import { OntologyService } from './services/ontology.service';
import { environment } from 'src/environments/environment';
import { EsService } from '../home/es.service';

@Component({
    selector: 'app-knowledge',
    templateUrl: './knowledge.component.html',
    styleUrls: ['./knowledge.component.scss']
})
export class KnowledgeComponent implements OnInit {
    ip = environment.ip;
    searchText: string = '';
    categories: Category[] = [];
    isLoading: boolean = false;

    // 添加实体相关属性
    entities: any[] = [];
    size: number = 20;
    index: number = 1;
    query: any = { must: [] };

    constructor(
        private categoryService: CategoryService,
        private ontologyService: OntologyService,
        private route: ActivatedRoute,
        private esService: EsService
    ) { }

    ngOnInit(): void {
        this.ontologyService
            .getList(1, Number.MAX_SAFE_INTEGER).subscribe((res: any) => {
                console.log('Fetched schema list:', res);
                this.categories = this.categoryService.buildCategoryTree(res.list);
            });

        // 加载实体列表
        this.esService
            .searchEntity(1, this.size, { bool: this.query })
            .subscribe((data: any) => {
                console.log(data);
                this.entities = data.list;
            });

        // Handle route params
        this.route.queryParams.subscribe(params => {
            const category = params['category'];
            if (category) {
                console.log('Current category path:', category);
            }
        });
    }

    onSearch(): void {
        // Reset pagination
        this.index = 1;
        this.entities = [];

        // Update query to include search text
        const searchQuery = {
            must: [
                ...this.query.must,
                {
                    multi_match: {
                        query: this.searchText,
                        fields: [
                            "labels.zh.value^3",
                            "descriptions.zh.value^2",
                            "content^1"
                        ]
                    }
                }
            ]
        };

        // Execute search
        this.esService
            .searchEntity(this.index, this.size, { bool: searchQuery })
            .subscribe((data: any) => {
                this.entities = data.list;
            });
    }

    clearSearch(): void {
        this.searchText = '';
        this.index = 1;
        this.entities = [];
        
        // Reset to base query without search text
        const baseQuery = { ...this.query };
        
        // Reload entities with base query
        this.esService
            .searchEntity(this.index, this.size, { bool: baseQuery })
            .subscribe((data: any) => {
                this.entities = data.list;
            });
    }

    // 无限滚动加载
    onScrollEntity() {
        this.index++;
        const currentQuery = this.searchText ? {
            must: [
                ...this.query.must,
                {
                    multi_match: {
                        query: this.searchText,
                        fields: [
                            "labels.zh.value^3",
                            "descriptions.zh.value^2",
                            "content^1"
                        ]
                    }
                }
            ]
        } : this.query;

        this.esService
            .searchEntity(this.index, this.size, { bool: currentQuery })
            .subscribe((data: any) => {
                if (data.list.length > 0) {
                    this.entities = [...this.entities, ...data.list];
                }
            });
    }

    // 获取卡片宽度
    getCardWidth(news: any): string {
        if (news?._source?.videos?.length > 0) {
            return 'span 2';
        }
        return 'span 1';
    }

    onCategorySelected(category: Category) {
        // Reset pagination
        this.index = 1;
        this.entities = [];

        if (category.name === '') {
            // 清空过滤条件
            this.query = { must: [] };
        } else {
            // 使用分类过滤
            this.query = {
                must: [{
                    match: {
                        "type.keyword": category.id
                    }
                }]
            };
        }

        // 重新加载实体
        this.esService
            .searchEntity(this.index, this.size, { bool: this.query })
            .subscribe((data: any) => {
                this.entities = data.list;
            });
    }
}
