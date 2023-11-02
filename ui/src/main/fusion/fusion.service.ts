import { Injectable, Query } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XTreeNode } from '@ng-nest/ui/tree';
import { XId } from '@ng-nest/ui/core';
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FusionService extends RepositoryService<Item> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/fusion' } });
  }
}



export interface Item extends XId {
  label?: string;
  description?: string;
  aliases?: string;
}
