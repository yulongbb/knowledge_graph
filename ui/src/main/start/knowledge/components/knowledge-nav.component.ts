import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-knowledge-nav',
  templateUrl: './knowledge-nav.component.html',
  styleUrls: ['./knowledge-nav.component.scss']
})
export class KnowledgeNavComponent implements OnInit {
  @Input() categories: Category[] = [];
  selectedPath: string[] = [];
  currentSelectedId: string | null = null;

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

  getRegularCategories(): Category[] {
    return this.categories.slice(2);
  }

  selectCategory(category: Category, level: number): void {
    if (category.id === 'discover' || category.id === 'following') {
      this.selectedPath = [];
      this.currentSelectedId = category.id;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { keyword:'', category: category.name }
      });
      return;
    }

    this.selectedPath = [category.id];
    this.currentSelectedId = category.id;
    
    const categoryPath = category.name;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword:'', category: categoryPath }
    });
  }

  getCurrentLevelCategories(): Category[] {
    // Always show root categories after fixed categories
    return this.getRegularCategories();
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
}
