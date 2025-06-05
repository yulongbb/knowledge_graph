import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-knowledge-nav',
  templateUrl: './knowledge-nav.component.html',
  styleUrls: ['./knowledge-nav.component.scss']
})
export class KnowledgeNavComponent implements OnInit {
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
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        const categoryNames = params['category'].split('/');
        this.findAndSelectCategoryByName(categoryNames);
      }
    });
  }

  findAndSelectCategoryByName(categoryNames: string[]) {
    let currentCategories = this.categories;
    this.selectedPath = [];
    
    for (const name of categoryNames) {
      const category = currentCategories.find(c => c.name === name);
      if (category) {
        this.selectedPath.push(category.id);
        this.currentSelectedId = category.id;
        currentCategories = category.children || [];
      }
    }
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
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { keyword: '', category: '' }
      });
      // 发送空分类信号，表示清除过滤条件
      this.categorySelected.emit({ ...category, name: '' });
      return;
    }

    // 设置当前选中的分类
    this.currentSelectedId = category.id;

    // 检查是否点击了已存在路径中的分类
    const existingIndex = this.selectedPath.indexOf(category.id);
    if (existingIndex !== -1) {
      // 如果点击的是路径中已有的分类，截取到该位置
      this.selectedPath = this.selectedPath.slice(0, existingIndex + 1);
      this.categorySelected.emit(category);
      return;
    }

    // 如果是新的子分类，添加到路径中
    this.selectedPath.push(category.id);

    const categoryPath = this.getSelectedCategoryPath()
      .map(c => c.name)
      .join('/');
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword: '', category: categoryPath }
    });

    // Emit selected category
    this.categorySelected.emit(category);
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
        categories = category.children || [];
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
    document.body.style.overflow = this.sideNavOpen ? 'hidden' : '';
  }

  // Close side navigation panel
  closeSideNav(): void {
    this.sideNavOpen = false;
    document.body.style.overflow = '';
  }

  // Select category and close side nav
  selectCategoryAndCloseSideNav(category: Category, level: number): void {
    this.selectCategory(category, level);
    this.closeSideNav();
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
}
