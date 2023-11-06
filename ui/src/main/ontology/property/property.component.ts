import { PageBase } from 'src/share/base/base-page';
import { Component, Query, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { Property, PropertyService } from './property.service';
import {
  XFormRow,
  XGuid,
  XMessageService,
  XQuery,
  XTableColumn,
  XTableComponent,
} from '@ng-nest/ui';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-property',
  templateUrl: 'property.component.html',
  styleUrls: ['./property.component.scss'],
})
export class PropertyComponent extends PageBase {
  formGroup = new UntypedFormGroup({});

  selected!: Property;
  type = 'add';
  loading = true;

  index = 1;

  query: XQuery = { filter: [] };

  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, query).pipe((x: any) => {
      return x;
    });

  columns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.5, left: 0,},
    { id: 'name', label: '名称', flex: 0.5, sort: true },
    { id: 'enName', label: '名称', flex: 0.5, sort: true },
    { id: 'description', label: '描述', flex: 2.5, sort: true },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    private service: PropertyService,
    public override indexService: IndexService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
  }

  ngOnInit() {}

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        let param = {};
        this.router.navigate([`./${type}`, param], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'info':
        this.router.navigate([`./${type}/${item.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'edit':
        this.router.navigate([`./${type}/${item.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'delete':
        // this.msgBox.confirm({
        //   title: '提示',
        //   content: `此操作将永久删除此条数据：${item.account}，是否继续？`,
        //   type: 'warning',
        //   callback: (action: XMessageBoxAction) => {
        //     action === 'confirm' &&
        //       this.service.delete(item.id).subscribe(() => {
        //         this.tableCom.change(this.index);
        //         this.message.success('删除成功！');
        //       });
        //   },
        // });
        break;
      case 'tree-info':
        // this.selected = item;
        // let filter = {
        //   field: 'id',
        //   value: item.id,
        //   operation: '=',
        //   relation: 'organizations',
        // } as any;
        // if (!this.query.filter || this.query.filter.length == 0) {
        //   this.query.filter = [filter];
        // } else {
        //   let flt = this.query.filter.find(
        //     (x) => x.field === 'id' && x.relation === 'organizations'
        //   );
        //   if (flt) flt.value = filter.value;
        //   else this.query.filter = [...this.query.filter, filter];
        // }
        // this.tableCom.change(1);
        break;
    }
  }
}
