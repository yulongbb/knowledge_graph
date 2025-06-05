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
      ...rootCategories
    ];
  }
}
