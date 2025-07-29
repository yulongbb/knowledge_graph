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

  findByName(name: string) {
    return this.http.get(`${this.option?.controller?.name}/name/${name}`);
  }

}

export interface Namespace extends XId {
  name?: string;
  description?: string;
  prefix?: string;
  uri?: string;
  createdAt?: Date;
}
