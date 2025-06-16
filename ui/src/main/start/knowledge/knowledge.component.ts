import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from './models/category.model';
import { CategoryService } from './services/category.service';
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

    // 添加当前路由类型
    currentRouteType: string = 'discover';

    constructor(
        private categoryService: CategoryService,
        private route: ActivatedRoute,
        private router: Router,
        private esService: EsService
    ) { }

    ngOnInit(): void {
        // Load category tree and add fixed categories
        this.loadCategoryTree();

        // 监听路由变化
        this.route.url.subscribe(urlSegments => {
            const path = urlSegments.map(segment => segment.path).join('/');
            this.handleRouteChange(path);
        });

        // 监听子路由参数变化
        this.route.params.subscribe(params => {
            if (params['category'] || params['subcategory'] || params['subsubcategory']) {
                this.handleCategoryRoute(params);
            }
        });
    }

    handleRouteChange(path: string) {
        console.log('Route changed to:', path);
        this.currentRouteType = path || 'discover';

        // 根据路由类型加载对应数据
        switch (this.currentRouteType) {
            case 'discover':
                this.loadDiscoverData();
                break;
            case 'following':
                this.loadFollowingData();
                break;
            case 'news':
                this.loadNewsData();
                break;
            case 'sports':
                this.loadSportsData();
                break;
            case 'games':
                this.loadGamesData();
                break;
            case 'ai-tools':
                this.loadAiToolsData();
                break;
            case 'navigation':
                this.loadNavigationData();
                break;
            case 'finance':
                this.loadFinanceData();
                break;
            case 'weather':
                this.loadWeatherData();
                break;
            case 'calendar':
                this.loadCalendarData();
                break;
            default:
                // 处理分类路由
                this.loadCategoryData(this.currentRouteType);
                break;
        }
    }

    handleCategoryRoute(params: any) {
        // 处理分类参数路由，使用label字段
        let targetCategory: Category | null = null;

        if (params['subsubcategory']) {
            targetCategory = this.findCategoryByLabel(params['subsubcategory']);
        } else if (params['subcategory']) {
            targetCategory = this.findCategoryByLabel(params['subcategory']);
        } else if (params['category']) {
            targetCategory = this.findCategoryByLabel(params['category']);
        }

        if (targetCategory) {
            this.onCategorySelected(targetCategory);
        }
    }

    // 数据加载方法
    loadDiscoverData() {
        this.selectedCategory = {
            id: 'discover',
            name: '发现',
            displayName: '发现',
            description: '发现新知识'
        } as Category;
        this.loadEntitiesForCategory(this.selectedCategory);
    }

    loadFollowingData() {
        this.selectedCategory = {
            id: 'following',
            name: '关注',
            displayName: '关注',
            description: '我关注的内容'
        } as Category;
        this.loadEntitiesForCategory(this.selectedCategory);
    }

    loadNewsData() {
        // 使用label字段查找资讯分类
        const newsCategory = this.findCategoryByLabel('news');
        if (newsCategory) {
            this.selectedCategory = newsCategory;
            this.loadEntitiesForCategory(newsCategory);
        }
    }

    loadSportsData() {
        // 使用label字段查找体育分类
        const sportsCategory = this.findCategoryByLabel('sports');
        if (sportsCategory) {
            this.selectedCategory = sportsCategory;
            this.loadEntitiesForCategory(sportsCategory);
        }
    }

    loadGamesData() {
        // 使用label字段查找游戏分类
        const gamesCategory = this.findCategoryByLabel('games');
        if (gamesCategory) {
            this.selectedCategory = gamesCategory;
            this.loadEntitiesForCategory(gamesCategory);
        }
    }

    loadAiToolsData() {
        // 使用label字段查找AI工具分类
        const aiCategory = this.findCategoryByLabel('ai-tools');
        if (aiCategory) {
            this.selectedCategory = aiCategory;
            this.loadEntitiesForCategory(aiCategory);
        }
    }

    loadNavigationData() {
        // 使用label字段查找导航分类
        const navCategory = this.findCategoryByLabel('navigation');
        if (navCategory) {
            this.selectedCategory = navCategory;
            this.loadEntitiesForCategory(navCategory);
        }
    }

    loadFinanceData() {
        // 使用label字段查找财经分类
        const financeCategory = this.findCategoryByLabel('finance');
        if (financeCategory) {
            this.selectedCategory = financeCategory;
            this.loadEntitiesForCategory(financeCategory);
        }
    }

    loadWeatherData() {
        // 使用label字段查找天气分类
        const weatherCategory = this.findCategoryByLabel('weather');
        if (weatherCategory) {
            this.selectedCategory = weatherCategory;
            this.loadEntitiesForCategory(weatherCategory);
        }
    }

    loadCalendarData() {
        // 使用label字段查找日历分类
        const calendarCategory = this.findCategoryByLabel('calendar');
        if (calendarCategory) {
            this.selectedCategory = calendarCategory;
            this.loadEntitiesForCategory(calendarCategory);
        }
    }

    loadCategoryData(categoryLabel: string) {
        // 使用label字段查找分类
        const category = this.findCategoryByLabel(categoryLabel);
        if (category) {
            this.selectedCategory = category;
            this.loadEntitiesForCategory(category);
        }
    }

    loadEntitiesForCategory(category: Category) {
        this.onCategorySelected(category);
    }

    // Load the category tree from API
    loadCategoryTree() {
        this.isLoading = true;

        // Create the fixed categories
        const discoverCategory = {
            id: 'discover',
            name: '发现',
            label: '发现',
            description: '发现新知识',
            children: [],
            path: 'discover',
            level: 1
        } as unknown as Category;

        const followCategory = {
            id: 'following',
            name: '关注',
            label: '关注',
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

                // 分类加载完成后，处理当前路由
                this.route.params.subscribe(params => {
                    this.handleCategoryRoute(params);
                });
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

    // 通过label字段查找分类
    findCategoryByLabel(label: string): Category | null {
        const searchInCategories = (categories: Category[]): Category | null => {
            for (const category of categories) {
                if (category.label === label) {
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
}
