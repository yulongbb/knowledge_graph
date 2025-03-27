import { Injectable } from '@angular/core';
import { Category, CategoryResponse } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
      if (category.pid) {
        const parent = categoryMap.get(category.pid);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(categoryMap.get(category.id)!);
        }
      } else {
        rootCategories.push(categoryMap.get(category.id)!);
      }
    });

    return [
      { id: 'discover', name: '发现', label: '发现', value: 0, children: [] } as unknown as Category,
      { id: 'following', name: '关注', label: '关注', value: 0, children: [] } as unknown as Category,
      ...rootCategories
    ];
  }
}
