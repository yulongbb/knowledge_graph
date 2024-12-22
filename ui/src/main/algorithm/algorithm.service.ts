import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmService {
  private segmentApiUrl = 'http://localhost:5555/segment';
  private recognizeApiUrl = 'http://localhost:5555/recognize';
  private extractApiUrl = 'http://localhost:5555/extract';

  constructor(private http: HttpClient) { }

  segmentText(text: string): Observable<any> {
    return this.http.post<any>(this.segmentApiUrl, { text });
  }

  recognizeEntities(words: string[]): Observable<any> {
    return this.http.post<any>(this.recognizeApiUrl, { words });
  }

  extractRelations(entities: any): Observable<any> {
    return this.http.post<any>(this.extractApiUrl, { entities });
  }
}