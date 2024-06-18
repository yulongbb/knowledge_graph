import { PageBase } from 'src/share/base/base-page';
import { Component, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow } from '@ng-nest/ui/table';
import { tap, map, Observable } from 'rxjs';
import { Query } from 'src/services/repository.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XPosition,
} from '@ng-nest/ui';
import { FusionService } from '../fusion/fusion.service';
import { PdfService } from './pdf.service';
import { OntologyService } from '../ontology/ontology/ontology.service';

@Component({
  selector: 'app-pdf',
  templateUrl: 'pdf.component.html',
  styleUrls: ['./pdf.component.scss'],
})
export class PdfComponent extends PageBase {
  id: any;
  knowledge: any;
  keyword = '';
  size = 20;
  index = 1;

  value: XPosition = 'right';

  visible!: boolean;

  detail(row: XTableRow, column: XTableColumn) {
    this.id = row.id[0].split('/')[1];
  }

  close() {
    this.id = null;
    this.visible = false;
  }

  data: any;
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

  constructor(
    private service: PdfService,
    public override indexService: IndexService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private msgBox: XMessageBoxService
  ) {

    super(indexService);
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {

      this.data = (index: number, size: number, query: Query) => this.service
        .getList(index, this.size, { collection: 'PDF_entity', type: 'PDF', keyword: `%${this.keyword}%` })
        .pipe(
          tap((x: any) => console.log(x)),
          map((x: any) => x)
        );

    });
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


  search(keyword: any) {
    this.data = (index: number, size: number, query: Query) =>
      this.service.getList(index, this.size, { collection: 'pdf', keyword: `%${keyword}%` }).pipe(
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
        ).then(() => {
        });
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

    }
  }
}
