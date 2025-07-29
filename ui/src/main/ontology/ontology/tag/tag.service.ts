import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';

@Injectable({ providedIn: 'root' })
export class TagService extends RepositoryService<any> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/tags' } });
  }
}
