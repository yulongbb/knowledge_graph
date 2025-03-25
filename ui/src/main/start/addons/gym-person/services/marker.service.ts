import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Marker } from '../models/marker.model';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {
  private apiUrl = '/api/markers'; // 使用相对路径，避免跨域问题

  constructor(private http: HttpClient) {}

  getMarkers(): Observable<Marker[]> {
    return this.http.get<Marker[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  createMarker(marker: Partial<Marker>): Observable<Marker> {
    return this.http.post<Marker>(this.apiUrl, marker)
      .pipe(catchError(this.handleError));
  }

  deleteMarker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '发生未知错误';
    if (error.error instanceof ErrorEvent) {
      // 客户端错误
      errorMessage = `错误: ${error.error.message}`;
    } else {
      // 后端返回的错误
      errorMessage = `服务器返回代码 ${error.status}, 错误信息: ${error.error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
