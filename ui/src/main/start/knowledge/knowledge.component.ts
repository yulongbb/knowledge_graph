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
        // First load namespaces as top-level categories instead of all ontologies
        this.loadNamespacesAsCategories();

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

    // Load namespaces as top-level categories
    loadNamespacesAsCategories() {
        this.isLoading = true;
        this.namespaceService.getList(1, 1000).subscribe(
            (response: any) => {
                console.log('Fetched namespaces:', response);
                
                // Create categories from namespaces
                const namespaceCategories:any = response.list.map((namespace: any) => {
                    return {
                        id: namespace.id,
                        name: namespace.name,
                        displayName: namespace.name,
                        description: namespace.description,
                        isNamespace: true, // Mark as namespace for identification
                        children: [], // Will be loaded when namespace is selected
                        path: namespace.name,
                        level: 1
                    } as unknown as Category;
                });

                // Add "All" category at the top
                const allCategory = {
                    id: 'all',
                    name: '',
                    displayName: '全部',
                    description: '显示所有实体',
                    isNamespace: false,
                    children: [],
                    path: 'all',
                    level: 1
                } as unknown as Category;

                this.categories = [allCategory, ...namespaceCategories];
                this.isLoading = false;
            },
            error => {
                console.error('Error loading namespaces:', error);
                this.isLoading = false;
            }
        );
    }

    // Load ontologies for a specific namespace
    loadOntologiesForNamespace(namespace: Category) {
        this.loadingOntologies = true;
        this.selectedNamespace = namespace;
        
        // Clear existing children
        namespace.children = [];
        
        const filter = [
            {
                field: 'namespaceId',
                value: namespace.id.toString()
            }
        ];

        this.ontologyService
            .getList(1, Number.MAX_SAFE_INTEGER, { filter: filter })
            .subscribe({
                next: (res: any) => {
                    console.log('Fetched ontologies for namespace:', res);
                    
                    // Build ontology tree structure as children
                    namespace.children = this.categoryService.buildCategoryTree(res.list);
                    
                    // Force update of categories array
                    this.categories = [...this.categories];
                    this.loadingOntologies = false;
                },
                error: (error) => {
                    console.error('Error loading ontologies:', error);
                    this.loadingOntologies = false;
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

    onCategorySelected(category: any) {
        // Check if this is a namespace level category and needs to load child ontologies
        if (category.isNamespace && category.children.length === 0) {
            // Load ontologies for this namespace
            this.loadOntologiesForNamespace(category);
            
            // Also filter entities by namespace if needed
            this.index = 1;
            this.entities = [];
            
            // Use namespace-specific filter
            this.query = {
                must: [{
                    match: {
                        "namespace.keyword": category.name
                    }
                }]
            };
            
            // Load entities for the namespace
            this.esService
                .searchEntity(this.index, this.size, { bool: this.query })
                .subscribe((data: any) => {
                    this.entities = data.list;
                });
                
            return;
        }
        
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
