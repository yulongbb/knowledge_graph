import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';

@Injectable({ providedIn: 'root' })
export class KnowledgeService extends RepositoryService<Knowledge> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/knowledge' } });
  }
}


export interface Knowledge extends XId {
  name?: string;
  image?: string;
}
