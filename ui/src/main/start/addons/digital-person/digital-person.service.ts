import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';

export interface CharacterConfig {
  name: string;
  role: string;
  greeting: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DigitalPersonService {
  private apiUrl = environment.apiUrl;

  private characters: CharacterConfig[] = [
    {
      name: "小智",
      role: "英文老师",
      greeting: "你好！我是小智，一个英文老师。我可以帮你解答问题、完成任务。",
    }
  ];

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

  getCharacters(): CharacterConfig[] {
    return this.characters;
  }

  getCurrentCharacter(): CharacterConfig {
    return this.characters[0]; // 默认返回第一个角色
  }

  updateCharacter(index: number, character: CharacterConfig): void {
    if (index >= 0 && index < this.characters.length) {
      this.characters[index] = { ...character };
    }
  }
}
