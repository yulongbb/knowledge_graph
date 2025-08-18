import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, retry, timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NamespaceService extends RepositoryService<Namespace> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/namespaces' } });
  }

  findByName(name: string): Observable<any> {
    return this.http.get(`${this.option?.controller?.name}/name/${name}`).pipe(
      timeout(10000), // 10秒超时
      retry(1), // 失败后重试1次
      catchError(error => {
        console.error('查找命名空间失败:', error);
        return of(null);
      })
    );
  }

  findByPrefix(prefix: string): Observable<any> {
    return this.http.get(`${this.option?.controller?.name}/prefix/${prefix}`).pipe(
      timeout(10000),
      retry(1),
      catchError(error => {
        console.error('根据前缀查找命名空间失败:', error);
        return of(null);
      })
    );
  }

  // 批量删除
  batchDelete(ids: string[]): Observable<any> {
    return this.http.delete(`${this.option?.controller?.name}/batch`, { ids }).pipe(
      timeout(30000), // 批量操作给更长的超时时间
      retry(1),
      catchError(error => {
        console.error('批量删除失败:', error);
        throw error;
      })
    );
  }

  // 验证命名空间数据
  validate(namespace: Namespace): Observable<any> {
    return this.http.post(`${this.option?.controller?.name}/validate`, namespace).pipe(
      timeout(10000),
      catchError(error => {
        console.error('验证命名空间失败:', error);
        return of({ valid: false, errors: ['验证失败'] });
      })
    );
  }
}

export interface Namespace extends XId {
  name?: string;
  description?: string;
  prefix?: string;
  uri?: string;
  createdAt?: Date;
}
