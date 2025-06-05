import { Injectable } from '@angular/core';
import { Category, CategoryResponse } from '../models/category.model';
import { HttpService } from 'src/services/http.service';
import { RepositoryService } from 'src/services/repository.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends RepositoryService<Category> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/categories' } });
  }

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

    return rootCategories;
  }

  getAllParentIds(id: string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/parent/${id}`);
  }

  getChildren(id: string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/children/${id}`);
  }
  
  getFormattedCategoryTree(): Observable<Category[]> {
    return this.getList(1, Number.MAX_SAFE_INTEGER, {
      sort: [
        { field: 'pid', value: 'asc' },
        { field: 'sort', value: 'asc' },
      ]
    }).pipe(
      map((response: any) => {
        const categories = response.list as Category[];
        return this.buildCategoryTree(categories);
      })
    );
  }
}
