import { PageBase } from 'src/share/base/base-page';
import { Component, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow } from '@ng-nest/ui/table';
import { tap, map } from 'rxjs';
import { Query } from 'src/services/repository.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XPosition,
} from '@ng-nest/ui';
import { EdgeService } from './edge.service';

@Component({
  selector: 'app-edge',
  templateUrl: 'edge.component.html',
  styleUrls: ['./edge.component.scss'],
})
export class EdgeComponent extends PageBase {
  id: any;
  keyword = '';
  size = 20;
  index = 1;

  value: XPosition = 'right';

  visible!: boolean;

  detail(row: XTableRow, column: XTableColumn) {
    console.log(row.id[0].split('/')[1]);
    this.id = row.id[0].split('/')[1];
  }

  close() {
    this.id = null;
    this.visible = false;
  }

  data = (index: number, size: number, query: Query) =>
    this.service
      .getLinks(index, this.size)
      .pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  checkedRows: XTableRow[] = [];

  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'actions', label: '操作', width: 150, right: 0 },

    { id: 'id', label: '序号', width: 150,  left: 0, },
    { id: 'from', label: '起始节点', flex: 0.5, sort: true },
    { id: 'property', label: '关系', flex: 1.5, sort: true },
    { id: 'to', label: '目标节点', flex: 1 },
  ];

  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    private service: EdgeService,
    public override indexService: IndexService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  setCheckedRows(checked: boolean, row: XTableRow) {
    if (checked) {
      if (!this.checkedRows.some((x) => x.id === row.id)) {
        this.checkedRows.push(row);
      }
    } else {
      if (this.checkedRows.some((x) => x.id === row.id)) {
        let index = this.checkedRows.findIndex((x) => x.id === row.id);
        this.checkedRows.splice(index, 1);
      }
    }
  }

  headCheckboxChange(headCheckbox: XTableHeadCheckbox) {
    // checked 属性来源于定义的 id 列
    const checked = headCheckbox.checkbox['checked'];
    for (let row of headCheckbox.rows) {
      this.setCheckedRows(checked, row);
    }

    console.log(this.checkedRows);
  }

  bodyCheckboxChange(row: XTableRow) {
    // checked 属性来源于定义的 id 列
    this.setCheckedRows(row['checked'], row);

    console.log(this.checkedRows);
  }


  search(keyword: any) {
    this.data = (index: number, size: number, query: Query) =>
      this.service.getLinks(index, this.size).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  action(type: string, item?: any) {
    console.log(type);
    switch (type) {
      case 'add':
        let param = {};
        this.router.navigate([`./${type}`, param], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'info':
        console.log(item);
        this.router.navigate(
          [`./${type}/${item.id}`],
          {
            relativeTo: this.activatedRoute,
          }
        );
        break;
      case 'edit':
        this.router.navigate(
          [`./${type}/${item.id.toString().split('/')[1]}`],
          {
            relativeTo: this.activatedRoute,
          }
        );
        break;
      case 'delete':

        if (this.checkedRows.length > 0) {
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除${this.checkedRows.length}关系，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              action === 'confirm' && this.checkedRows.forEach((item) => {
                this.service.delete(item.id).subscribe(() => {
                  this.tableCom.change(this.index);
                  this.message.success('删除成功！');
                });
              })

            },
          });
        } else {
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除此条数据，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              action === 'confirm' &&
                this.service.delete(item.id).subscribe(() => {
                  this.tableCom.change(this.index);
                  this.message.success('删除成功！');
                });
            },
          });
        }
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
