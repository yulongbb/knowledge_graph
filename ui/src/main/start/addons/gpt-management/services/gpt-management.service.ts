import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GptModel } from '../models/gpt-model.interface';

@Injectable({
  providedIn: 'root'
})
export class GptManagementService {
  private apiUrl = '/api/gpt-management';

  constructor(private http: HttpClient) {}

  getAll(): Observable<GptModel[]> {
    return this.http.get<GptModel[]>(this.apiUrl);
  }

  getOne(id: number): Observable<GptModel> {
    return this.http.get<GptModel>(`${this.apiUrl}/${id}`);
  }

  create(model: FormData): Observable<GptModel> {
    return this.http.post<GptModel>(this.apiUrl, model);
  }

  update(id: number, model: FormData): Observable<GptModel> {
    return this.http.put<GptModel>(`${this.apiUrl}/${id}`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
