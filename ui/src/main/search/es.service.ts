import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EsService extends RepositoryService<any> {
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
