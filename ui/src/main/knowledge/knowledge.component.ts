import { PageBase } from 'src/share/base/base-page';
import { Component, Query, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { Knowledge, KnowledgeService } from './knowledge.service';
import {
  XFormRow,
  XGuid,
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XQuery,
  XTableColumn,
  XTableComponent,
} from '@ng-nest/ui';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-knowledge',
  templateUrl: 'knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
})
export class KnowledgeComponent extends PageBase {
  formGroup = new UntypedFormGroup({});

  selected!: Knowledge;
  type = 'add';
  loading = true;

  index = 1;

  query: XQuery = { filter: [] };

  data: any;

  columns: XTableColumn[] = [
    { id: 'index', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'actions', label: '操作', width: 150, right: 0 },
    { id: 'name', label: '名称', flex: 1.5, sort: true },
    { id: 'description', label: '描述', flex: 0.5, sort: true },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    private service: KnowledgeService,
    public override indexService: IndexService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  ngOnInit() {
    this.service.getList(1, 10, this.query).subscribe((data) => {
      this.data = data;
    });
  }

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
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${item.name}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
              this.service.delete(item.id).subscribe(() => {
                this.tableCom.change(this.index);
                this.message.success('删除成功！');
              });
          },
        });
        break;
      case 'data':
        this.router.navigate([`./${type}/nodes`], {
          relativeTo: this.activatedRoute,
        });
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
