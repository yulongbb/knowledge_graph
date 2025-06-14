import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EntityService extends RepositoryService<Item> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/knowledge' } });
  }


  fusion(extraction: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}`, extraction);
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post(`${this.option.controller?.name}`, item);
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.put(`${this.option.controller?.name}`, item);
  }

  deleteItem(id: String): Observable<Item> {
    return this.http.delete(`${this.option.controller?.name}/${id}`, );
  }


  getItem(id: number | string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/${id}`);
  }

  addEdge(edge: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}/link`, edge);
  }

  updateEdge(edge: any): Observable<any> {
    return this.http.put(`${this.option.controller?.name}/link`, edge);
  }

  deleteEdge(id: any): Observable<any> {
    return this.http.delete(`${this.option.controller?.name}/link/${id}`);
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


  graph(
    index?: number,
    size?: number,
    id?: string,
    query?: Query
  ): Observable<Array<any>> {
    index = index ? index : 1;
    size = size ? size : 10;
    console.log(`${this.option.controller?.name}/graph/${id}/${size}/${index}`)
    return this.http.post(
      `${this.option.controller?.name}/graph/${id}/${size}/${index}`,
      query
    );
  }

  getAllGraph(index: number, size: number, query: any): Observable<any> {
    return this.http.post(`${this.option.controller?.name}/graphAll/${size}/${index}`, query);
  }


  import(
    data: any
  ): Observable<Array<any>> {
    return this.http.post(
      `${this.option.controller?.name}/import`,
      data
    );
  }


  jobs(): Observable<Array<any>> {
    return this.http.get(
      `${this.option.controller?.name}/jobs`,
    );
  }


  view(knowledge:any): Observable<Array<any>> {
    return this.http.post(
      `${this.option.controller?.name}/view`,
      knowledge
    );
  }

  render(id: string) {
    return this.http.get(`${this.option.controller?.name}/render/${id}`);
  }

  createBatchTask(task: any): Observable<any> {
    return this.http.post(
      `${this.option.controller?.name}/batch-task`,
      task
    );
  }
  
  getBatchTask(id: string): Observable<any> {
    return this.http.get(
      `${this.option.controller?.name}/batch-task/${id}`
    );
  }
  
  updateBatchTask(task: any): Observable<any> {
    return this.http.put(
      `${this.option.controller?.name}/batch-task`,
      task
    );
  }
  
  getBatchTasks(): Observable<any> {
    return this.http.get(
      `${this.option.controller?.name}/batch-tasks`
    );
  }
}

export interface Item extends XId {
  label?: string;
  description?: string;
  aliases?: string;
}
