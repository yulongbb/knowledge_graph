import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NamespaceService extends RepositoryService<Namespace> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/namespaces' } });
  }

  getDefault() {
    return this.http.get(`${this.option?.controller?.name}/default`).pipe(
      catchError(err => {
        if (err.status === 404) {
          console.log('Default namespace not found, creating one...');
          return this.createDefaultNamespace();
        }
        throw err;
      })
    );
  }

  findByName(name: string) {
    return this.http.get(`${this.option?.controller?.name}/name/${name}`);
  }

  /**
   * Create default namespace if it doesn't exist
   */
  createDefaultNamespace(): Observable<Namespace> {
    const defaultNamespace: Namespace = {
      name: 'default',
      prefix: 'def',
      description: '系统默认命名空间',
      uri: 'http://example.org/default'
    };

    return this.post(defaultNamespace).pipe(
      catchError(err => {
        console.error('Failed to create default namespace:', err);
        throw err;
      })
    );
  }

  /**
   * Ensures default namespace exists
   * First tries to get it, if not found, creates it
   */
  ensureDefaultNamespace(): Observable<Namespace> {
    return this.findByName('default').pipe(
      catchError(err => {
        if (err.status === 404) {
          return this.createDefaultNamespace();
        }
        throw err;
      })
    );
  }
}

export interface Namespace extends XId {
  name?: string;
  description?: string;
  prefix?: string;
  uri?: string;
  createdAt?: Date;
}
