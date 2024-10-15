import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XId } from '@ng-nest/ui/core';

@Injectable({ providedIn: 'root' })
export class ApplicationService extends RepositoryService<Application> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/applications' } });
  }
}


export interface Application extends XId {
  name?: string;
  schemas?: any;
}
