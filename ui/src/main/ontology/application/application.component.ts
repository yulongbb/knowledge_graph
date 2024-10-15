import { PageBase } from 'src/share/base/base-page';
import { Component, Query, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import {
  XFormRow,
  XGuid,
  XMessageService,
  XQuery,
  XTableColumn,
  XTableComponent,
  XTreeNode,
} from '@ng-nest/ui';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { Application, ApplicationService } from './application.sevice';
import { OntologyService } from '../ontology/ontology.service';

@Component({
  selector: 'app-application',
  templateUrl: 'application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent extends PageBase {
  formGroup = new UntypedFormGroup({});
  name = '';
  enName = '';
  description= '';
  selected!: Application;
  type = 'add';
  loading = true;

  index = 1;
  size = 15;

  query: XQuery = { filter: [] };

  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, query).pipe(
      tap((x:any) => console.log(x)),
      map((x:any) => {
        x.list.forEach((item: any) => {

          this.ontologyService
          .getList(1, 50, {
            filter: [
              {
                field: 'id',
                value: item.id,
                relation: 'applications',
                operation: '=',
              },
            ],
          })
          .subscribe((p: any) => {
            console.log(p.list[0].id);
            item.ontologies = p.list.map((o:any)=> o.id);
          });

        })
        return x;

      })
    );

  model: any;
  tree: XTreeNode[] = [
    { id: 1, label: '雷浩集团' },
    { id: 2, label: '企业发展事业群', pid: 1 },
    { id: 3, label: '社交网络事业群', pid: 1 },
    { id: 4, label: '互动娱乐事业群', pid: 1 },
    { id: 5, label: '移动互联网事业群', pid: 1 },
    { id: 6, label: '网络媒体事业群', pid: 1 },
    { id: 7, label: '人事部', pid: 4 },
    { id: 8, label: '行政部', pid: 4 },
    { id: 9, label: '财务部', pid: 4 },
  ];

  columns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.4, left: 0 },
    { id: 'actions', label: '操作', width: 200 },
    { id: 'name', label: '名称', flex: 0.5, sort: true },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    private service: ApplicationService,
    public override indexService: IndexService,
    private message: XMessageService,
    private ontologyService: OntologyService,

    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
  }

  ngOnInit() {}

  searchName(name: any) {
    this.query.filter = [{ field: 'name', value: name as string }];
    this.data = (index: number, size: number, query: Query) =>
      this.service.getList(index, this.size, this.query).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  searchEnName(enName: any) {
    this.query.filter = [{ field: 'enName', value: enName as string }];
    this.data = (index: number, size: number, query: Query) =>
      this.service.getList(index, this.size, this.query).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  searchDescription(description: any) {
    this.query.filter = [{ field: 'description', value: description as string }];
    this.data = (index: number, size: number, query: Query) =>
      this.service.getList(index, this.size, this.query).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
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
