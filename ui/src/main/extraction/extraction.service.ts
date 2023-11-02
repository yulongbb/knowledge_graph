import { Injectable, Query } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';

@Injectable({ providedIn: 'root' })
export class ExtractionService extends RepositoryService<Item> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/extraction' } });
  }
}

export interface Item extends XId {
  subject?: string;
  property?: string;
  object?: string;
}
