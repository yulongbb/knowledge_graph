import { PageBase } from 'src/share/base/base-page';
import { Component } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn } from '@ng-nest/ui/table';
import { tap, map } from 'rxjs';
import { FusionService } from 'src/main/fusion/fusion.service';
import { Query } from 'src/services/repository.service';

@Component({
  selector: 'app-fusion',
  templateUrl: 'fusion.component.html',
  styleUrls: ['./fusion.component.scss'],
})
export class FusionComponent extends PageBase {
  keyword = '';

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
  ];

  constructor(
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
