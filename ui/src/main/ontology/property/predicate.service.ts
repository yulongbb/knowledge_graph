import { Injectable } from '@angular/core';
import { Query, RepositoryService } from 'src/services/repository.service';
import { HttpService } from 'src/services/http.service';
import { XTreeNode } from '@ng-nest/ui/tree';
import { XId } from '@ng-nest/ui/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PredicateService extends RepositoryService<Predicate> {
    constructor(public override http: HttpService) {
        super(http, { controller: { name: 'api/predicate' } });
    }
}

export interface Predicate extends XId {
    name?: string;
    description?: string;
    enName?: string;
    enDescription?: string;
    head?: string;
    tail?: string;
}
