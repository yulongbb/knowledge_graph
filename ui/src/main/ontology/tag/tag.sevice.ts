import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';

@Injectable({ providedIn: 'root' })
export class TagService extends RepositoryService<Tag> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/tags' } });
  }
}


export interface Tag extends XId {
  name?: string;
  type?: string;
}
