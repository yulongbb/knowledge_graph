import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntityService extends RepositoryService<Item> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/node' } });
  }


  fusion(extraction: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}`, extraction);
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post(`${this.option.controller?.name}/entity`, item);
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.put(`${this.option.controller?.name}/entity`, item);
  }


  getItem(id: number | string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/${id}`);
  }

  getLinks(
    index?: number,
    size?: number,
    id?: string,
    query?: Query
  ): Observable<Array<any>> {
    index = index ? index : 1;
    size = size ? size : 10;
    console.log(`${this.option.controller?.name}/link/${id}/${size}/${index}`)
    return this.http.post(
      `${this.option.controller?.name}/link/${id}/${size}/${index}`,
      query
    );
  }
}

export interface Item extends XId {
  label?: string;
  description?: string;
  aliases?: string;
}
