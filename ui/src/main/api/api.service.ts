import { Injectable } from '@angular/core';
import { RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { Observable } from 'rxjs';
import { XId } from '@ng-nest/ui/core';

export interface FieldMapping {
  [key: string]: {
    role: 'id' | 'attr' | 'ignore';
    type: string;
  };
}

export interface DataInterface extends XId {
  interfaceName: string;
  type: 'REST' | 'SPARQL';
  url: string;
  query?: string;
  method: string;
  fieldMapping: FieldMapping;
}

@Injectable({ providedIn: 'root' })
export class ApiService extends RepositoryService<DataInterface> {
  constructor(public override http: HttpService) {
    super(http, { controller: { name: 'api/api-interface' } });
  }
}
