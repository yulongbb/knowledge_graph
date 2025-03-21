import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DigitalPersonService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getChatCompletion(message: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'DeepSeek-R1-Distill-Qwen-14B',
      messages: [{ role: 'user', content: message }],
      stream: true
    };

    return this.http.post(this.apiUrl + '/chat/completions', body, {
      headers,
      observe: 'response',
      responseType: 'blob'
    });
  }
}
