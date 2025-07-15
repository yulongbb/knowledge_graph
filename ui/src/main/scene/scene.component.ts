import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { PageBase } from 'src/share/base/base-page';
import { IndexService } from 'src/layout/index/index.service';
import {
  XMessageService,
  XTableColumn,
  XTableComponent,
  XTableRow,
  XTableHeadCheckbox
} from '@ng-nest/ui';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Namespace, NamespaceService } from '../ontology/namespace/namespace.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent extends PageBase implements OnInit {
  @ViewChild('tableCom') tableCom!: XTableComponent;

  index = 1;
  size = 15;
  query: any;
  name = '';
  prefix = '';
  description = '';
  keyword = '';
  checkedRows: XTableRow[] = [];

  data = (index: number, size: number, query: any) =>
    this.namespaceService.getList(index, size, query).pipe(map((x: any) => x));

  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'actions', label: '操作', width: 120, right: 0 },
    { id: 'id', label: '序号', width: 80, left: 0 },
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'prefix', label: '前缀', flex: 0.6, sort: true },
    { id: 'uri', label: 'URI', flex: 1.2, sort: true },
    { id: 'description', label: '描述', flex: 1, sort: true },
  ];

  constructor(
    private namespaceService: NamespaceService,
    public override indexService: IndexService,
    private message: XMessageService,
    private msgBox: XMessageBoxService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
  }

  ngOnInit() {
    // 初始化
  }

  search(keyword: string) {
    this.query = {};
    if (keyword) {
      this.query.filter = [
        { field: 'name', value: keyword },
        { field: 'prefix', value: keyword },
        { field: 'description', value: keyword }
      ];
    }
    this.tableCom.change(1);
  }

  resetSearch() {
    this.keyword = '';
    this.query = {};
    this.tableCom.change(1);
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
    const checked = headCheckbox.checkbox['checked'];
    for (let row of headCheckbox.rows) {
      this.setCheckedRows(checked, row);
    }
  }

  bodyCheckboxChange(row: XTableRow) {
    this.setCheckedRows(row['checked'], row);
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        this.router.navigate(['/index/scene/add']);
        break;
      case 'info':
        this.router.navigate(['/index/scene/info', item.id]);
        break;
      case 'edit':
        this.router.navigate(['/index/scene/edit', item.id]);
        break;
      case 'delete':
        if (this.checkedRows.length > 0) {
          if (this.checkedRows.some(row => row['name'] === 'default')) {
            this.message.warning('默认命名空间不能删除！');
            return;
          }
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除${this.checkedRows.length}条数据，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              if (action === 'confirm') {
                this.checkedRows.forEach((row) => {
                  this.namespaceService.delete(row.id).subscribe(() => {
                    this.message.success('删除成功！');
                    this.tableCom.change(1);
                  });
                });
                this.checkedRows = [];
              }
            },
          });
        } else if (item) {
          if (item.name === 'default') {
            this.message.warning('默认命名空间不能删除！');
            return;
          }
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除此条数据：${item.name}，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              if (action === 'confirm') {
                this.namespaceService.delete(item.id).subscribe(() => {
                  this.message.success('删除成功！');
                  this.tableCom.change(1);
                });
              }
            },
          });
        }
        break;
    }
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.index = 1;
    this.tableCom.change(this.index);
  }
}
