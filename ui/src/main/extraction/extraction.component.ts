import { PageBase } from 'src/share/base/base-page';
import { Component, Query, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XFormRow, XGuid, XQuery, XTableColumn, XTableComponent } from '@ng-nest/ui';
import { Extraction, ExtractionService } from './extraction.service';
import { map, tap } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss'],
})
export class ExtractionComponent extends PageBase {
  // formGroup = new UntypedFormGroup({});

  // selected!: Extraction;
  // type = 'add';
  // loading = true;

  // controls: XFormRow[] = [
  //   {
  //     controls: [
  //       {
  //         control: 'input',
  //         id: 'subject',
  //         label: '主体',
  //         required: true,
  //       },

  //       {
  //         control: 'input',
  //         id: 'property',
  //         label: '属性',
  //         required: true,
  //       },

  //       {
  //         control: 'input',
  //         id: 'object',
  //         label: '对象',
  //         required: true,
  //       },
  //     ],
  //   }
  // ];

  // get disabled() {
  //   return !['edit', 'add',].includes(this.type);
  // }

  // data = (index: number, size: number, query: Query) =>
  //   this.service.getList(index, size).pipe(
  //     tap((x: any) => console.log(x)),
  //     map((x: any) => x)
  //   );
  index = 1;

  query: XQuery = { filter: [] };

  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, query).pipe((x: any) => {
      return x;
    });

  columns: XTableColumn[] = [
    { id: 'index', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'subject', label: '实体', flex: 1.5, sort: true },
    { id: 'property', label: '属性', flex: 0.5, sort: true },
    { id: 'object', label: '值', flex: 1 },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    public override indexService: IndexService,
    private service: ExtractionService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
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

  // action(type: string, extraction?: Extraction) {
  //   console.log(type)
  //   switch (type) {
  //     case 'add':
  //       let param = {};
  //       if (this.selected) {
  //         param = {
  //           selectedId: this.selected?.id,
  //         };
  //       }
  //       this.router.navigate([`./${type}`, param], {
  //         relativeTo: this.activatedRoute,
  //       });
  //       break;
  //     case 'save':
  //       if (this.type === 'add') {
  //         console.log(this.formGroup.value);
  //         this.service.post(this.formGroup.value).subscribe((x) => {
  //           this.type = 'info';
  //           console.log(x);
  //           this.message.success('新增成功！');
  //         });
  //       } else if (this.type === 'edit') {
  //         // this.service.put(this.formGroup.value).subscribe(() => {
  //         //   this.type = 'info';
  //         //   this.treeCom.updateNode(node, this.formGroup.value);
  //         //   this.message.success('修改成功！');
  //         // });
  //       }
  //       break;
  //     // case 'delete':
  //     //   this.msgBox.confirm({
  //     //     title: '提示',
  //     //     content: `此操作将永久删除此条数据：${schema.label}，是否继续？`,
  //     //     type: 'warning',
  //     //     callback: (action: XMessageBoxAction) => {
  //     //       action === 'confirm' &&
  //     //         this.service.delete(schema.id).subscribe(() => {
  //     //           console.log(schema);
  //     //           this.treeCom.removeNode(schema);
  //     //           this.formGroup.reset();
  //     //           this.message.success('删除成功！');
  //     //         });
  //     //     },
  //     //   });
  //       break;
  //   }
  // }
}
