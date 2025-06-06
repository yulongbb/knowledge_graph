import { Component, ViewChild } from '@angular/core';
import { XTableColumn, XTableComponent } from '@ng-nest/ui/table';
import { UsersService } from './users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import {
  OrganizationService,
  Organization,
} from '../organization/organization.service';
import { XQuery } from '@ng-nest/ui/core';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { PageBase } from 'src/share/base/base-page';

@Component({
  selector: 'app-users',
  templateUrl: 'users.component.html',
})
export class UsersComponent extends PageBase {
  index = 1;
  query: any
  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, query).pipe((x: any) => {
      return x;
    });
  treeLoading = true;
  treeData = () =>
    this.organization.getList(1, Number.MAX_SAFE_INTEGER).pipe(
      tap(() => (this.treeLoading = false)),
      map((x) => x.list)
    );
  selected!: Organization;
  columns: XTableColumn[] = [
    { id: 'index', label: '序号', width: 80, left: 0, type: 'index' },
    { id: 'actions', label: '操作', width: 100, left: 80 },
    { id: 'account', label: '用户', width: 100, left: 180, sort: true },
    { id: 'name', label: '姓名', width: 80, sort: true },
    { id: 'email', label: '邮箱', flex: 1 },
    { id: 'phone', label: '电话', flex: 1 },
  ];

  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    public service: UsersService,
    public override indexService: IndexService,
    private organization: OrganizationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        let param = {};
        if (this.selected) {
          param = {
            selectedId: this.selected?.id,
            selectedLabel: this.selected?.label,
          };
        }
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
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${item.account}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
            console.log(this.tableCom);
            console.log(this.index);
              this.service.delete(item.id).subscribe(() => {
                this.tableCom.change(this.index);
                this.message.success('删除成功！');
              });
          },
        });
        break;
      case 'tree-info':
        this.selected = item;
        let filter = {
          field: 'id',
          value: item.id,
          operation: '=',
          relation: 'organizations',
        } as any;
        if (!this.query.filter || this.query.filter.length == 0) {
          this.query.filter = [filter];
        } else {
          let flt = this.query.filter.find(
            (x:any) => x.field === 'id' && x.relation === 'organizations'
          );
          if (flt) flt.value = filter.value;
          else this.query.filter = [...this.query.filter, filter];
        }
        this.tableCom.change(1);
        break;
    }
  }
}
