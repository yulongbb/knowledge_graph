import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';

@Injectable({ providedIn: 'root' })
export class QualifyService extends RepositoryService<any> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/qualifies' } });
  }
}
