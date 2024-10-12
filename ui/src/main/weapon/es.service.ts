import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EsService extends RepositoryService<any> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/knowledge' } });
  }


  searchEntity( index?: number,
    size?: number, query?: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}/search/${size}/${index}`,query);
  }


  getEntity(id: any): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/get/${id}`);
  }



  getNumber(ids: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}/number`, ids);
  }


}
