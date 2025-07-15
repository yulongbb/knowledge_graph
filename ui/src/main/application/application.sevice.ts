import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApplicationService extends RepositoryService<Application> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/addons' } }); 
  }

  // 获取所有置顶应用
  getPinned(): Observable<Application[]> {
    // 修改此行，确保controller.name存在
    const controllerName = this.option?.controller?.name || 'api/addons';
    return this.http.get(`${controllerName}/pinned`) as Observable<Application[]>;
  }

  // 获取所有分类
  getCategories(): Observable<string[]> {
    const controllerName = this.option?.controller?.name || 'api/addons';
    return this.http.get(`${controllerName}/categories`) as Observable<string[]>;
  }

  // 通过分类获取应用
  getByCategory(category: string): Observable<Application[]> {
    const controllerName = this.option?.controller?.name || 'api/addons';
    return this.http.get(`${controllerName}/category/${category}`) as Observable<Application[]>;
  }
  
  // 为应用评分
  rateApplication(id: number, rating: number): Observable<Application> {
    const controllerName = this.option?.controller?.name || 'api/addons';
    return this.http.post(`${controllerName}/${id}/rate`, { rating }) as Observable<Application>;
  }
}

export interface Application extends XId {
  name?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  image?: string;
  url?: string;
  isPinned?: boolean;
  screenshots?: string[];
  tags?: string[];
  totalRatings?: number;
  userRatings?: number[];
  namespaces?: any[];
}
