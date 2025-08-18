import { Component, OnInit, ViewChild, signal, ChangeDetectorRef } from '@angular/core';
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
import { map, catchError, finalize, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { NamespaceService } from './namespace.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent extends PageBase implements OnInit {
  @ViewChild('tableCom') tableCom!: XTableComponent;

  index = 1;
  size = 15;
  query: any = {};
  keyword = '';
  checkedRows: XTableRow[] = [];
  loading = false;
  batchDeleting = false;

  data = (index: number, size: number, query: any) => {
    this.loading = true;
    return this.namespaceService.getList(index, size, query).pipe(
      map((x: any) => {
        this.loading = false;
        return x;
      }),
      catchError((error) => {
        this.loading = false;
        this.message.error('数据加载失败：' + (error.message || '网络错误，请稍后重试'));
        return of({ list: [], total: 0 });
      })
    );
  };

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
    this.loading = true;
    this.query = {};
    if (keyword && keyword.trim()) {
      // 使用OR逻辑搜索多个字段
      this.query.search = keyword.trim();
    }
    this.index = 1; // 重置到第一页
    this.tableCom.change(1);
  }

  resetSearch() {
    this.keyword = '';
    this.query = {};
    this.index = 1;
    this.loading = false;
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
          this.batchDelete();
        } else if (item) {
          this.singleDelete(item);
        } else {
          this.message.warning('请选择要删除的数据！');
        }
        break;
    }
  }

  private batchDelete() {
    // 检查是否包含默认命名空间
    const defaultNamespaces = this.checkedRows.filter(row => row['name'] === 'default');
    if (defaultNamespaces.length > 0) {
      this.message.warning('默认命名空间不能删除！请取消选择后重试。');
      return;
    }

    this.msgBox.confirm({
      title: '批量删除确认',
      content: `您确定要删除选中的 ${this.checkedRows.length} 条记录吗？此操作不可撤销！`,
      type: 'warning',
      callback: (action: XMessageBoxAction) => {
        if (action === 'confirm') {
          this.performBatchDelete();
        }
      },
    });
  }

  private performBatchDelete() {
    this.batchDeleting = true;
    const deleteIds = this.checkedRows.map(row => row.id);
    
    // 使用 forkJoin 并发执行删除操作
    const deleteRequests = deleteIds.map(id => 
      this.namespaceService.delete(id).pipe(
        catchError(error => {
          console.error(`删除ID ${id} 失败:`, error);
          return of({ success: false, id, error });
        })
      )
    );

    forkJoin(deleteRequests).subscribe({
      next: (results) => {
        this.batchDeleting = false;
        const failedCount = results.filter((r: any) => r.success === false).length;
        const successCount = results.length - failedCount;
        
        if (failedCount === 0) {
          this.message.success(`成功删除 ${successCount} 条记录！`);
        } else {
          this.message.warning(`删除完成！成功：${successCount} 条，失败：${failedCount} 条`);
        }
        
        this.checkedRows = [];
        this.tableCom.change(this.index);
      },
      error: (error) => {
        this.batchDeleting = false;
        this.message.error('批量删除操作失败：' + (error.message || '未知错误'));
      }
    });
  }

  private singleDelete(item: any) {
    if (item.name === 'default') {
      this.message.warning('默认命名空间不能删除！');
      return;
    }

    this.msgBox.confirm({
      title: '删除确认',
      content: `您确定要删除命名空间"${item.name}"吗？此操作不可撤销！`,
      type: 'warning',
      callback: (action: XMessageBoxAction) => {
        if (action === 'confirm') {
          this.namespaceService.delete(item.id).subscribe({
            next: () => {
              this.message.success('删除成功！');
              this.tableCom.change(this.index);
            },
            error: (error) => {
              this.message.error('删除失败：' + (error.message || '未知错误'));
            }
          });
        }
      },
    });
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.index = 1;
    this.tableCom.change(this.index);
  }
}
