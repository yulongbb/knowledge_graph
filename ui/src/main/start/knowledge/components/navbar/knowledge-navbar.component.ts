import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-knowledge-navbar',
  templateUrl: './knowledge-navbar.component.html',
  styleUrls: ['./knowledge-navbar.component.scss']
})
export class KnowledgeNavbarComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Output() categorySelected = new EventEmitter<Category>();
  selectedPath: string[] = [];
  currentSelectedId: string | null = null;
  sideNavOpen: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 监听路由变化
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(segment => segment.path).join('/');
      this.updateSelectedFromRoute(path);
    });

    // 监听参数变化
    this.route.params.subscribe(params => {
      this.updateSelectedPathFromRoute(params);
    });
  }

  updateSelectedFromRoute(path: string) {
    // 处理固定路由
    const routeMapping: { [key: string]: string } = {
      'discover': 'discover',
      'following': 'following',
      'news': 'news',
      'sports': 'sports', 
      'games': 'games',
      'ai-tools': 'ai-tools',
      'navigation': 'navigation',
      'finance': 'finance',
      'weather': 'weather',
      'calendar': 'calendar'
    };

    if (routeMapping[path]) {
      if (path === 'discover' || path === 'following') {
        const category = this.categories.find(c => c.id === path);
        if (category) {
          this.currentSelectedId = category.id;
          this.categorySelected.emit(category);
        }
      } else {
        // 使用label字段查找分类
        const category = this.findCategoryByLabel(routeMapping[path]);
        if (category) {
          this.currentSelectedId = category.id;
          this.categorySelected.emit(category);
        }
      }
    }
  }

  updateSelectedPathFromRoute(params: any) {
    this.selectedPath = [];
    
    if (params['category']) {
      // 使用label字段查找分类
      const category = this.findCategoryByLabel(params['category']);
      if (category) {
        this.selectedPath.push(category.id);
        this.currentSelectedId = category.id;
        this.categorySelected.emit(category);
      }
    }
    
    if (params['subcategory']) {
      // 使用label字段查找子分类
      const subcategory = this.findCategoryByLabel(params['subcategory']);
      if (subcategory) {
        this.selectedPath.push(subcategory.id);
        this.currentSelectedId = subcategory.id;
        this.categorySelected.emit(subcategory);
      }
    }
    
    if (params['subsubcategory']) {
      // 使用label字段查找子子分类
      const subsubcategory = this.findCategoryByLabel(params['subsubcategory']);
      if (subsubcategory) {
        this.selectedPath.push(subsubcategory.id);
        this.currentSelectedId = subsubcategory.id;
        this.categorySelected.emit(subsubcategory);
      }
    }
    
    // 如果没有路由参数，默认选择发现
    if (!params['category'] && !params['subcategory'] && !params['subsubcategory']) {
      const discoverCategory = this.categories.find(c => c.id === 'discover');
      if (discoverCategory) {
        this.currentSelectedId = 'discover';
        this.categorySelected.emit(discoverCategory);
      }
    }
  }

  // 添加通过label字段查找分类的方法
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

  getFixedCategories(): Category[] {
    return this.categories.slice(0, 2); // 发现和关注
  }

  getCategoryTrees(): Category[] {
    return this.categories.slice(2); // All category trees
  }

  selectCategory(category: Category, level: number): void {
    if (category.id === 'discover' || category.id === 'following') {
      this.selectedPath = [];
      this.currentSelectedId = category.id;
      this.router.navigate(['/start/knowledge', category.id]);
      this.categorySelected.emit(category);
      return;
    }

    // 设置当前选中的分类
    this.currentSelectedId = category.id;

    // 检查是否是特殊类型的分类，使用label字段进行匹配
    const specialRoutes: { [key: string]: string } = {
      'news': 'news',
      'sports': 'sports',
      'games': 'games',
      'ai-tools': 'ai-tools',
      'navigation': 'navigation',
      'finance': 'finance',
      'weather': 'weather',
      'calendar': 'calendar'
    };

    if (specialRoutes[category.label]) {
      this.router.navigate(['/start/knowledge', specialRoutes[category.label]]);
      this.categorySelected.emit(category);
      return;
    }

    // 普通分类使用label字段构建路径
    const categoryPath = this.buildCategoryPath(category);
    this.router.navigate(['/start/knowledge', ...categoryPath]);
    this.categorySelected.emit(category);
  }

  buildCategoryPath(category: Category): string[] {
    const path: string[] = [];
    
    // 找到从根到当前分类的完整路径
    const findPath = (cat: Category, target: Category, currentPath: Category[]): boolean => {
      currentPath.push(cat);
      
      if (cat.id === target.id) {
        return true;
      }
      
      if (cat.children) {
        for (const child of cat.children as Category[]) {
          if (findPath(child, target, currentPath)) {
            return true;
          }
        }
      }
      
      currentPath.pop();
      return false;
    };
    
    // 在所有顶级分类中查找路径
    for (const topCategory of this.getCategoryTrees()) {
      const pathToCategory: Category[] = [];
      if (findPath(topCategory, category, pathToCategory)) {
        // 使用label字段构建路径
        return pathToCategory.map(c => c.label);
      }
    }
    
    return [category.label];
  }

  getCurrentLevelCategories(): Category[] {
    if (this.selectedPath.length === 0 || 
        this.currentSelectedId === 'discover' || 
        this.currentSelectedId === 'following') {
      return this.getCategoryTrees();
    }

    let result: Category[] = [];
    let currentLevel = this.categories;
    
    // 找到第一个选中的分类
    const firstSelectedCategory = currentLevel.find(c => c.id === this.selectedPath[0]);
    if (!firstSelectedCategory) return this.getCategoryTrees();

    // 返回第一个选中的分类及其子分类
    result = [firstSelectedCategory];
    if (firstSelectedCategory.children) {
      result = result.concat(firstSelectedCategory.children);
    }

    // 如果选中了子分类，添加子分类的子分类
    if (this.selectedPath.length > 1) {
      const lastSelected = result.find(c => c.id === this.selectedPath[1]);
      if (lastSelected?.children) {
        result = result.concat(lastSelected.children);
      }
    }

    return result;
  }

  getSelectedCategoryPath(): Category[] {
    const path: Category[] = [];
    let categories = this.categories;
    
    for (const id of this.selectedPath) {
      const category = categories.find(c => c.id === id);
      if (category) {
        path.push(category);
        categories = category.children as Category[] || [];
      }
    }
    return path;
  }

  isSelected(category: Category): boolean {
    return category.id === this.currentSelectedId;
  }

  // Check if the navigation button should be shown
  get showNavButton(): boolean {
    return this.selectedPath.length > 0 || 
           (this.currentSelectedId !== null && 
            this.currentSelectedId !== 'discover' && 
            this.currentSelectedId !== 'following');
  }

  // Toggle side navigation panel
  toggleSideNav(): void {
    this.sideNavOpen = !this.sideNavOpen;
  }

  // Close side navigation panel
  closeSideNav(): void {
    this.sideNavOpen = false;
  }

  // Get all top level categories for the side panel
  getTopLevelCategories(): Category[] {
    return this.categories.slice(2); // Skip fixed categories
  }

  // Get subcategories for a category
  getSubcategories(category: Category): Category[] {
    return category.children || [];
  }
  
  // Flatten the category tree for the side panel
  getFlattenedCategories(): Category[] {
    const flattenedCategories: Category[] = [];
    
    const processCategory = (category: Category, level: number = 0) => {
      // Add the category with its level
      const processedCategory = { ...category, level: level };
      flattenedCategories.push(processedCategory);
      
      // Process children if they exist
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          processCategory(child, level + 1);
        });
      }
    };
    
    // Start with top-level categories (skip fixed ones)
    this.getCategoryTrees().forEach(category => {
      processCategory(category);
    });
    
    return flattenedCategories;
  }

  // Select category and close side nav
  selectCategoryAndCloseSideNav(category: Category, level: number): void {
    this.selectCategory(category, level);
    this.closeSideNav();
  }
}
