import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';
import { XTreeNode } from '@ng-nest/ui';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QualifyService extends RepositoryService<Qualify> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/qualifers' } });
  }

  getQualifyByName(name: number | string): Observable<any> {
    return this.http.get(`${this.option.controller?.name}/name/${name}`);
  }

}


export interface Qualify extends XId {
  name?: string;
  description?: string;
  enName?: string;
  enDescription?: string;
}
