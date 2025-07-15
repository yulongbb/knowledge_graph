import { Component, OnInit, ViewChild } from '@angular/core';
import { PageBase } from 'src/share/base/base-page';
import { IndexService } from 'src/layout/index/index.service';
import {
  XMessageService,
  XTableColumn,
  XTableComponent,
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

  data = (index: number, size: number, query: any) =>
    this.namespaceService.getList(index, size, query).pipe(map((x: any) => x));

  columns: XTableColumn[] = [
    { id: 'id', label: '序号', width: 80, left: 0 },
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'prefix', label: '前缀', flex: 0.6, sort: true },
    { id: 'uri', label: 'URI', flex: 1.2, sort: true },
    { id: 'description', label: '描述', flex: 1, sort: true },
    { id: 'actions', label: '操作', width: 120, right: 0 },
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

  searchName(name: any) {
    this.query = this.query || {};
    this.query.filter = [{ field: 'name', value: name as string }];
    this.tableCom.change(1);
  }

  searchPrefix(prefix: any) {
    this.query = this.query || {};
    this.query.filter = [{ field: 'prefix', value: prefix as string }];
    this.tableCom.change(1);
  }

  searchDescription(description: any) {
    this.query = this.query || {};
    this.query.filter = [
      { field: 'description', value: description as string },
    ];
    this.tableCom.change(1);
  }

  resetSearch() {
    this.name = '';
    this.prefix = '';
    this.description = '';
    this.query = {};
    this.tableCom.change(1);
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        this.router.navigate(['/index/namespace/add']);
        break;
      case 'info':
        this.router.navigate(['/index/namespace/info', item.id]);
        break;
      case 'edit':
        this.router.navigate(['/index/namespace/edit', item.id]);
        break;
      case 'delete':
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
        break;
    }
  }
}
