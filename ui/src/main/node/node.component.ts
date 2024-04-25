import { PageBase } from 'src/share/base/base-page';
import { Component, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow } from '@ng-nest/ui/table';
import { tap, map, Observable } from 'rxjs';
import { NodeService } from 'src/main/node/node.service';
import { Query } from 'src/services/repository.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XPosition,
} from '@ng-nest/ui';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { FusionService } from '../fusion/fusion.service';

@Component({
  selector: 'app-node',
  templateUrl: 'node.component.html',
  styleUrls: ['./node.component.scss'],
})
export class NodeComponent extends PageBase {
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
      .getList(index, this.size, { collection: 'entity', keyword: `%${this.keyword}%` })
      .pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  checkedRows: XTableRow[] = [];

  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'actions', label: '操作', width: 150, right: 0 },
    { id: 'index', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'label', label: '标签', flex: 1.5, sort: true },
    { id: 'type', label: '类型', flex: 1.5, sort: true },
    { id: 'description', label: '描述', flex: 0.5, sort: true },
    { id: 'aliases', label: '别名', flex: 1 },
  ];

  @ViewChild('tableCom') tableCom!: XTableComponent;
  model1: any;

  data1 = (index: number, size: number, query: any) =>

    new Observable<string[]>((x) => {
      this.knowledgeService.getList(index, size, query).subscribe((data: any) => {
        console.log(data.list);
        x.next(data.list);
        x.complete();
      })

    });

  constructor(
    private knowledgeService: KnowledgeService,
    private fusionService: FusionService,

    private service: NodeService,
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
      this.service.getList(index, this.size, { collection: 'entity', keyword: `%${keyword}%` }).pipe(
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
          [`./${type}/${item.id.toString().split('/')[1]}`],
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
                this.service.delete(item.id[0].split('/')[1]).subscribe(() => {
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
                this.service.delete(item.id[0].split('/')[1]).subscribe(() => {
                  this.tableCom.change(this.index);
                  this.message.success('删除成功！');
                });
            },
          });
        }
        break;
      case 'upload':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将：${this.checkedRows.length}条数据推送到知识库，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' && this.knowledgeService.get(this.model1).subscribe((knowledge: any) => {
              console.log(this.checkedRows);
              console.log(knowledge);
              this.fusionService.knowledge(this.checkedRows, knowledge.description).subscribe(() => {
                this.tableCom.change(this.index);
                this.message.success('成功！');
              })


            })
          },
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
