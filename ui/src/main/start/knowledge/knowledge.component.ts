import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from './models/category.model';
import { CategoryService } from './services/category.service';
import { OntologyService } from './services/ontology.service';
import { environment } from 'src/environments/environment';
import { EsService } from '../home/es.service';
import { NamespaceService } from '../../ontology/namespace/namespace.service';

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
    loadingOntologies: boolean = false;
    selectedNamespace: any = null;

    // 添加实体相关属性
    entities: any[] = [];
    size: number = 20;
    index: number = 1;
    query: any = { must: [] };

    constructor(
        private categoryService: CategoryService,
        private ontologyService: OntologyService,
        private namespaceService: NamespaceService,
        private route: ActivatedRoute,
        private esService: EsService
    ) { }

    ngOnInit(): void {
        // Load all categories and ontologies at initialization
        this.loadAllCategories();

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

    // Load all categories including fixed categories and all ontologies
    loadAllCategories() {
        this.isLoading = true;
        
        // First load namespaces
        this.namespaceService.getList(1, 1000).subscribe(
            (response: any) => {
                console.log('Fetched namespaces:', response);
                
                // Create the fixed categories
                const discoverCategory = {
                    id: 'discover',
                    name: '发现',
                    displayName: '发现',
                    description: '发现新知识',
                    isNamespace: false,
                    children: [],
                    path: 'discover',
                    level: 1
                } as unknown as Category;

                const followCategory = {
                    id: 'following',
                    name: '关注',
                    displayName: '关注',
                    description: '我关注的内容',
                    isNamespace: false,
                    children: [],
                    path: 'following',
                    level: 1
                } as unknown as Category;
                
                // Set initial categories with discover and follow
                this.categories = [discoverCategory, followCategory];
                
                // Create namespace categories
                const namespaces = response.list;
                
                // Now load all ontologies across all namespaces
                this.ontologyService
                    .getList(1, Number.MAX_SAFE_INTEGER)
                    .subscribe({
                        next: (ontologiesRes: any) => {
                            console.log('Fetched all ontologies:', ontologiesRes);
                            
                            // Process ontologies and group them by namespace
                            const ontologiesByNamespace = this.groupOntologiesByNamespace(ontologiesRes.list, namespaces);
                            
                            // Add all namespaces with their ontologies to categories
                            const namespacesWithOntologies = namespaces.map((namespace: any) => {
                                return {
                                    id: namespace.id,
                                    name: namespace.name,
                                    displayName: namespace.name,
                                    description: namespace.description,
                                    isNamespace: true,
                                    children: ontologiesByNamespace[namespace.id] || [],
                                    path: namespace.name,
                                    level: 1
                                } as unknown as Category;
                            });
                            
                            // Add namespace categories to the main categories array
                            this.categories = [...this.categories, ...namespacesWithOntologies];
                            console.log('Loaded categories with ontologies:', this.categories);
                            this.isLoading = false;
                        },
                        error: (error) => {
                            console.error('Error loading ontologies:', error);
                            this.isLoading = false;
                        }
                    });
            },
            error => {
                console.error('Error loading namespaces:', error);
                this.isLoading = false;
            }
        );
    }

    // Helper method to group ontologies by namespace ID
    groupOntologiesByNamespace(ontologies: any[], namespaces: any[]): { [key: string]: Category[] } {
        const result: { [key: string]: Category[] } = {};
        
        // Initialize empty arrays for each namespace
        namespaces.forEach(namespace => {
            result[namespace.id] = [];
        });
        
        // Group ontologies by namespace
        ontologies.forEach(ontology => {
            const namespaceId = ontology.namespaceId;
            if (result[namespaceId]) {
                result[namespaceId].push({
                    id: ontology.id,
                    name: ontology.name,
                    displayName: ontology.name,
                    description: ontology.description,
                    isNamespace: false,
                    children: [],
                    path: `${namespaces.find(n => n.id === namespaceId)?.name}/${ontology.name}`,
                    level: 2
                } as unknown as Category);
            }
        });
        
        // Build category trees for each namespace
        Object.keys(result).forEach(namespaceId => {
            result[namespaceId] = this.categoryService.buildCategoryTree(result[namespaceId]);
        });
        
        return result;
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

    // Update the onCategorySelected method to not load ontologies on namespace selection
    onCategorySelected(category: any) {
        // Reset pagination
        this.index = 1;
        this.entities = [];

        if (category.name === '') {
            // 清空过滤条件
            this.query = { must: [] };
        } else if (category.id === 'discover') {
            // 发现分类逻辑 - 显示最新添加的实体
            this.query = {
                must: [],
                sort: [{ "created_at": "desc" }]
            };
        } else if (category.id === 'following') {
            // 关注分类逻辑 - 可以从用户关注数据中获取
            // 这里暂时展示一个示例过滤条件，实际实现需要根据用户关注数据
            this.query = {
                must: [{
                    match: {
                        "followed": true
                    }
                }]
            };
        } else if (category.isNamespace) {
            console.log('Selected namespace:', category);
            // 使用命名空间过滤实体
            this.query = {
                must: [{
                    match: {
                        "namespace.keyword": category.id
                    }
                }]
            };
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
    
    // Remove the loadOntologiesForNamespace method as it's no longer needed
    // The ontologies are now loaded at initialization
}
