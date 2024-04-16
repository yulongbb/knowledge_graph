import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XTreeNode } from '@ng-nest/ui/tree';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OntologyService extends RepositoryService<Schema> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/schemas' } });
  }

}


export interface Schema extends XTreeNode {
  label?: string;
  description?: string;
  pid?: any;
  path?: string;
}
