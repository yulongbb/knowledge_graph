import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';

@Injectable({ providedIn: 'root' })
export class DatasetService extends RepositoryService<Dataset> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/dataset' } });
  }
}


export interface Dataset extends XId {
  name?: string;
  type?: string;
  schemas?: any;
}
