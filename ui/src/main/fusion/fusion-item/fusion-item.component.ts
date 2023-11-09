import { ChangeDetectionStrategy, Component, Input, OnInit, } from '@angular/core';
import { XTableColumn, XTableRow } from '@ng-nest/ui';
import { XGuid } from '@ng-nest/ui/core';
import { FusionService } from '../fusion.service';
import { map, tap } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Query } from 'src/services/repository.service';

@Component({
  selector: 'app-fusion-item',
  templateUrl: './fusion-item.component.html',
  styleUrls: ['./fusion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FusionItemComponent implements OnInit {
  @Input() id:any

  keyword = '';
  title = '实体详情';
  data:any;

  columns: XTableColumn[] = [
    { id: 'index', label: '序号', width: 85, left: 0, type: 'index' },
    { id: 'property', label: '属性名', width: 200 },
    { id: 'value', label: '值', flex: 1 },
  ];

  constructor(   
    private service: FusionService,
    ) {
   
    }
    

  

  ngOnInit() {
    console.log(this.id)
    this.data = (index: number, size: number,id: string, query: Query) =>
    this.service.getLinks(index, size, this.id, query).pipe(
      tap((x: any) => console.log(x)),
      map((x: any) => x)
    );
  }

  add() {
    // this.data = [...this.data, { id: XGuid(), name: '', position: '', status: false }];
  }

  del(row: XTableRow) {
    const index = this.data.findIndex((x:any) => x.id === row.id);
    if (index >= 0) {
      this.data.splice(index, 1);
    }
  }



}