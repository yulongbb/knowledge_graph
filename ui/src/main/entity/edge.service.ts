import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';

import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EdgeService extends RepositoryService<any> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/edge' } });
  }

  // getItem(id: number | string): Observable<any> {
  //   return this.http.get(`${this.option.controller?.name}/${id}`);
  // }
  addEdge(edge: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}`, edge);
  }

  updateEdge(edge: any): Observable<any> {
    return this.http.put(`${this.option.controller?.name}`, edge);
  }

  deleteEdge(id: any): Observable<any> {
    return this.http.delete(`${this.option.controller?.name}/${id}`);
  }

  getLinks(
    index?: number,
    size?: number,
  ): Observable<any> {
    index = index ? index : 1;
    size = size ? size : 10;
    return this.http.post(
      `${this.option.controller?.name}/search/${size}/${index}`,
    );
  }
}
