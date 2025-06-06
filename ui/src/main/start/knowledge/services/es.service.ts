import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EsService {
  
  constructor(private http: HttpClient) { }

  searchEntity(index: number, size: number, query: any): Observable<any> {
    return this.http.post('/api/search/entity', {
      index,
      size,
      query
    });
  }

  getEntity(id: string): Observable<any> {
    return this.http.get(`/api/search/entity/${id}`);
  }
}
