import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FusionService extends RepositoryService<Item> {

  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/fusion' } });
  }


  fusion(extractions: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}`, extractions);
  }

  restore(extractions: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}/restore`, extractions);
  }

  knowledge(nodes: any, collection: any) {
    return this.http.post(`${this.option.controller?.name}/${collection}`, nodes);
  }

  addItem(item: Item, collection: string): Observable<Item> {
    return this.http.post(`${this.option.controller?.name}/entity/${collection}`, item);
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.put(`${this.option.controller?.name}/entity`, item);
  }


  getItem(id: number | string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/entity/${id}`);
  }

  getLinks(
    index?: number,
    size?: number,
    id?: string,
    query?: Query
  ): Observable<any> {
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