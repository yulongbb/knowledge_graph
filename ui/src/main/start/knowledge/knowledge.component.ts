import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from './models/category.model';
import { CategoryService } from './services/category.service';
import { environment } from 'src/environments/environment';
import { EsService } from '../home/es.service';
import { forkJoin } from 'rxjs';

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

    // 记录当前选中分类
    selectedCategory: Category | null = null;

    // 添加推荐内容数据
    recommendList = [
        { id: 1, title: '成语起源地，故事有新篇——循迹文脉走读"万年仙居"', image: 'assets/news1.jpg' },
        { id: 2, title: '2025全国高考天气地图:江南北部雨强且持续', image: 'assets/news2.jpg' },
        { id: 3, title: '为什么全网都爱看江苏"内斗"?', image: 'assets/news3.jpg' }
    ];

    // 添加日历事件数据
    calendarEvents = [
        { date: new Date(2023, 4, 15), time: '09:00', title: '产品发布会', description: '新产品发布会，介绍最新技术和功能' },
        { date: new Date(2023, 4, 18), time: '14:30', title: '团队会议', description: '讨论项目进度和未来规划' },
        { date: new Date(2023, 4, 20), time: '10:00', title: '客户沟通', description: '与重要客户讨论合作事宜' },
        { date: new Date(2023, 4, 25), time: '16:00', title: '技术研讨', description: '跨部门技术问题讨论' }
    ];

    constructor(
        private categoryService: CategoryService,
        private route: ActivatedRoute,
        private esService: EsService
    ) { }

    ngOnInit(): void {
        // Load category tree and add fixed categories
        this.loadCategoryTree();

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

    // Load the category tree from API
    loadCategoryTree() {
        this.isLoading = true;
        
        // Create the fixed categories
        const discoverCategory = {
            id: 'discover',
            name: '发现',
            displayName: '发现',
            description: '发现新知识',
            children: [],
            path: 'discover',
            level: 1
        } as unknown as Category;

        const followCategory = {
            id: 'following',
            name: '关注',
            displayName: '关注',
            description: '我关注的内容',
            children: [],
            path: 'following',
            level: 1
        } as unknown as Category;
        
        // Set initial categories with discover and follow
        this.categories = [discoverCategory, followCategory];
        
        // Load categories from API
        this.categoryService.getFormattedCategoryTree().subscribe({
            next: (categoryTree) => {
                console.log('Fetched category tree:', categoryTree);
                // Add API categories to the fixed categories
                this.categories = [...this.categories, ...categoryTree];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading categories:', error);
                this.isLoading = false;
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

    // 获取所有子分类名称的辅助方法
    getAllSubcategoryNames(category: Category): string[] {
        let names: string[] = [category.name];
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                names = [...names, ...this.getAllSubcategoryNames(child as Category)];
            });
        }
        return names;
    }

    // Update to use category name for tag filtering
    onCategorySelected(category: any) {
        // 记录当前选中分类
        this.selectedCategory = category;

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
            this.query = {
                must: [{
                    match: {
                        "followed": true
                    }
                }]
            };
        } else {
            // 获取当前分类及其所有子分类的名称
            const allCategoryNames = this.getAllSubcategoryNames(category);

            // 使用tags字段进行筛选，创建OR关系查询
            this.query = {
                must: [{
                    bool: {
                        should: allCategoryNames.map(name => ({
                            match: {
                                "tags": name
                            }
                        })),
                        minimum_should_match: 1
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

    // 检查是否为资讯类型或其子类型
    isNewsCategory(): boolean {
        // 如果没有选中分类，返回false
        if (!this.selectedCategory) {
            return false;
        }
        
        // 如果选中的是资讯分类，直接返回true
        if (this.selectedCategory.name === '资讯') {
            return true;
        }
        
        // 查找资讯分类
        const newsCategory = this.findCategoryByName('资讯');
        if (!newsCategory) {
            return false;
        }
        
        // 检查选中的分类是否是资讯的子分类
        return this.isSubcategoryOf(this.selectedCategory, newsCategory);
    }

    // 通过名称查找分类
    findCategoryByName(name: string): Category | null {
        const searchInCategories = (categories: Category[]): Category | null => {
            for (const category of categories) {
                if (category.name === name) {
                    return category;
                }
                
                if (category.children && category.children.length > 0) {
                    const found = searchInCategories(category.children as Category[]);
                    if (found) return found;
                }
            }
            return null;
        };
        
        return searchInCategories(this.categories);
    }

    // 检查一个分类是否是另一个分类的子分类
    isSubcategoryOf(child: Category, possibleParent: Category): boolean {
        // 如果直接是子分类
        if (child.pid === possibleParent.id) {
            return true;
        }
        
        // 递归检查父类链
        if (child.pid) {
            const parentCategory = this.findCategoryById(child.pid);
            if (parentCategory) {
                return this.isSubcategoryOf(parentCategory, possibleParent);
            }
        }
        
        return false;
    }

    // 通过ID查找分类
    findCategoryById(id: string): Category | null {
        const searchInCategories = (categories: Category[]): Category | null => {
            for (const category of categories) {
                if (category.id === id) {
                    return category;
                }
                
                if (category.children && category.children.length > 0) {
                    const found = searchInCategories(category.children as Category[]);
                    if (found) return found;
                }
            }
            return null;
        };
        
        return searchInCategories(this.categories);
    }

    // 检查是否为日历类型
    isCalendarCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === '日历';
    }

    // 检查是否为天气类型
    isWeatherCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === '天气';
    }

    // 检查是否为财经类型
    isFinanceCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === '财经';
    }

    // 检查是否为导航类型
    isNavigationCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === '导航';
    }

    // 检查是否为AI类型
    isAiToolsCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === 'AI大全' || this.selectedCategory.name === '人工智能';
    }

    // 检查是否为体育类型
    isSportsCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === '体育';
    }

    // 检查是否为游戏类型
    isGamesCategory(): boolean {
        if (!this.selectedCategory) {
            return false;
        }
        
        return this.selectedCategory.name === '游戏';
    }

    // 日历日期选择事件处理
    onDateSelected(date: Date): void {
        console.log('Selected date:', date);
        // 这里可以根据选定的日期过滤或获取事件数据
    }
}
