import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XTreeNode } from '@ng-nest/ui/tree';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService extends RepositoryService<Category> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/categories' } });
  }
  
  getAllParentIds(id: string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/parent/${id}`);
  }

  getChildren(id: string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/children/${id}`);
  }
}

export interface Category extends XTreeNode {
  label?: string;
  description?: string;
  pid?: any;
  path?: string;
  icon?: string;
  color?: string;
  sort?: number;
}
