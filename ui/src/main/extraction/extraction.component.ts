import { PageBase } from 'src/share/base/base-page';
import { Component, Query } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService } from '@ng-nest/ui/message-box';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn } from '@ng-nest/ui';
import { ExtractionService } from './extraction.service';
import { map, tap } from 'rxjs';

@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss'],
})
export class ExtractionComponent extends PageBase {
  data = (index: number, size: number, query: Query) =>
    this.service.getList(index, size).pipe(
      tap((x: any) => console.log(x)),
      map((x: any) => x)
    );

  columns: XTableColumn[] = [
    { id: 'index', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'subject', label: '实体', flex: 1.5, sort: true },
    { id: 'property', label: '属性', flex: 0.5, sort: true },
    { id: 'object', label: '值', flex: 1 },
  ];

  constructor(
    public override indexService: IndexService,
    private service: ExtractionService
  ) {
    super(indexService);
  }
}
