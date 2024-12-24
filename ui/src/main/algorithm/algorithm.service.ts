import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmService {
  private segmentApiUrl = 'http://10.117.1.238:5555/segment';
  private recognizeApiUrl = 'http://10.117.1.238:5555/recognize';
  private extractApiUrl = 'http://10.117.1.238:5555/extract';

  constructor(private http: HttpClient) { }

  segmentText(text: string): Observable<any> {
    return this.http.post<any>(this.segmentApiUrl, { text });
  }

  recognizeEntities(text: string[]): Observable<any> {
    return this.http.post<any>(this.recognizeApiUrl, { text });
  }

  extractRelations(text: any): Observable<any> {
    return this.http.post<any>(this.extractApiUrl, { text });
  }
}