import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { XTreeNode } from '@ng-nest/ui';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertyService extends RepositoryService<Property> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/properties' } });
  }

  getPropertyByName(name: number | string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/name/${name}`);
  }

}


export interface Property extends XId {
  name?: string;
  description?: string;
  enName?: string;
  enDescription?: string;
}
