import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XTreeNode } from '@ng-nest/ui/tree';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService extends RepositoryService<any> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/redis' } });
  }

  getValue(key: any): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/get/${key}`);
  }



  getNumber(ids: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}/number`, ids);
  }


  getEntity(query: any): Observable<any> {
    return this.http.post(`api/es/search`, query);
  }

}
