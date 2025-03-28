import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  constructor(private http: HttpClient) {}

  getSchemas(): Observable<any> {
    return this.http.post('/api/schemas/100/1', null);
  }

  // 获取属性的字典列表
  getDictionaryList(propertyId: string): Observable<any> {
    return this.http.get(`/api/dictionary/property/${propertyId}`);
  }

  getProperties(schemaId: string): Observable<any> {
    const query = {
      filter: [
        {
          field: 'id',
          value: [schemaId],
          relation: 'schemas',
          operation: 'IN'
        }
      ]
    };
    return this.http.post('/api/properties/100/1', query);
  }

  saveDictionary(data: any): Observable<any> {
    if (data.id) {
      return this.http.put(`/api/dictionary/${data.id}`, data);
    }
    return this.http.post('/api/dictionary', data);
  }

  deleteDictionary(id: string): Observable<any> {
    return this.http.delete(`/api/dictionary/${id}`);
  }

  createSubtype(data: any): Observable<any> {
    return this.http.post('/api/schemas', data);
  }

  createProperty(data: any): Observable<any> {
    return this.http.post('/api/properties', data);
  }

  deleteSubtype(id: string): Observable<any> {
    return this.http.delete(`/api/schemas/${id}`);
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`/api/properties/${id}`);
  }
}
