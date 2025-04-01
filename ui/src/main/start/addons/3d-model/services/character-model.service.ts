import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CharacterFilter, CharacterModel } from '../models/character-model';

@Injectable({
  providedIn: 'root'
})
export class CharacterModelService {
  private apiUrl = '/api/3d-models';  // 更新为实际的API路径

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<CharacterModel[]> {
    return this.http.get<CharacterModel[]>(this.apiUrl).pipe(
      map(response => {
        console.log('Got characters:', response);  // 添加日志
        return response.map(character => ({
          ...character,
          previewUrl: character.previewUrl ? `http://localhost:9000/3d-models/${character.previewUrl}` : undefined,
          thumbnailUrl: character.thumbnailUrl ? `http://localhost:9000/3d-models/${character.thumbnailUrl}` : undefined
        }));
      }),
      catchError(error => {
        console.error('Get characters error:', error);  // 添加错误日志
        throw error;
      })
    );
  }

  uploadModel(file: File, metadata: Partial<CharacterModel>): Observable<CharacterModel> {
    const formData = new FormData();
    formData.append('file', file);
    
    const modelDto = {
      name: metadata.name,
      description: metadata.description || '',
      category: metadata.category || 'Other',
      tags: metadata.tags || []
    };
    formData.append('metadata', JSON.stringify(modelDto));

    console.log('Uploading file:', file.name);  // 添加日志
    console.log('Metadata:', modelDto);  // 添加日志

    return this.http.post<CharacterModel>(this.apiUrl, formData).pipe(
      map(response => {
        console.log('Upload success:', response);  // 添加日志
        return response;
      }),
      catchError(error => {
        console.error('Upload error:', error);  // 添加错误日志
        throw error;
      })
    );
  }

  searchCharacters(filter: CharacterFilter): Observable<CharacterModel[]> {
    let params = new HttpParams();
    if (filter.search) params = params.set('search', filter.search);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.tags?.length) params = params.set('tags', filter.tags.join(','));

    return this.http.get<CharacterModel[]>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => {
        return response.map(character => ({
          ...character,
          previewUrl: character.previewUrl ? `http://localhost:9000/3d-models/${character.previewUrl}` : undefined,
          thumbnailUrl: character.thumbnailUrl ? `http://localhost:9000/3d-models/${character.thumbnailUrl}` : undefined
        }));
      }),
      catchError(error => {
        console.error('Search characters error:', error); // 添加错误日志
        throw error;
      })
    );
  }

  updateCharacter(id: string, character: CharacterModel): Observable<CharacterModel> {
    // 转换为UpdateModelDto格式
    const updateDto = {
      name: character.name,
      description: character.description,
      category: character.category,
      tags: character.tags,
      thumbnailUrl: character.thumbnailUrl,
      previewUrl: character.previewUrl
    };
    return this.http.put<CharacterModel>(`${this.apiUrl}/${id}`, updateDto);
  }

  deleteCharacter(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tags`);
  }

  getAllCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }
}
