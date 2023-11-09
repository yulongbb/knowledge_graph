import { PageBase } from 'src/share/base/base-page';
import { Component } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn, XTableRow } from '@ng-nest/ui/table';
import { tap, map } from 'rxjs';
import { FusionService } from 'src/main/fusion/fusion.service';
import { Query } from 'src/services/repository.service';
import { ActivatedRoute, Router } from '@angular/router';
import { XPosition } from '@ng-nest/ui';

@Component({
  selector: 'app-fusion',
  templateUrl: 'fusion.component.html',
  styleUrls: ['./fusion.component.scss'],
})
export class FusionComponent extends PageBase {
  keyword = '';

  value: XPosition = 'right';

  visible!: boolean;

  detail(row: XTableRow, column: XTableColumn) {
    console.log(row.id[0].split('/')[1]);
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  data = (index: number, size: number, query: Query) =>
    this.service.getList(index, size, { keyword: `%${this.keyword}%` }).pipe(
      tap((x: any) => console.log(x)),
      map((x: any) => x)
    );

  columns: XTableColumn[] = [
    { id: 'index', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'label', label: '标签', flex: 1.5, sort: true },
    { id: 'description', label: '描述', flex: 0.5, sort: true },
    { id: 'aliases', label: '别名', flex: 1 },
    { id: 'actions', label: '操作', width: 100, right: 0 },
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: FusionService,
    public override indexService: IndexService
  ) {
    super(indexService);
  }

  ngOnInit() {}

  search(keyword: any) {
    this.data = (index: number, size: number, query: Query) =>
      this.service.getList(index, size, { keyword: `%${keyword}%` }).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }
}
