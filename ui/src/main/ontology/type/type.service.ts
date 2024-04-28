import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XTreeNode } from '@ng-nest/ui/tree';

@Injectable({ providedIn: 'root' })
export class TypeService extends RepositoryService<Type> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/types' } });
  }

}


export interface Type extends XTreeNode {
  label?: string;
  description?: string;
  pid?: any;
  path?: string;
}
