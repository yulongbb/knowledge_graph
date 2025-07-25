import { Component, ViewChild } from '@angular/core';
import { PageBase } from 'src/share/base/base-page';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn, XTableComponent, XTableRow } from '@ng-nest/ui/table';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { OntologyService, Schema } from 'src/main/ontology/ontology/ontology.service';
import { UntypedFormGroup } from '@angular/forms';
import { tap, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { XOperation } from '@ng-nest/ui';

@Component({
  selector: 'app-ontology',
  templateUrl: 'ontology.component.html',
  styleUrls: ['./ontology.component.scss'],
})
export class OntologyComponent extends PageBase {
  formGroup = new UntypedFormGroup({});
  type = 'info';
  selected!: Schema;
  columns: XTableColumn[] = [
    { id: 'actions', label: '操作', width: 120, right: 0 },
    { id: 'id', label: 'ID', width: 120 },
    { id: 'name', label: '名称', flex: 1 },
    { id: 'label', label: '标签', flex: 1 },
    { id: 'description', label: '描述', flex: 2 }
  ];
  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, {filter: [{ field: 'pid',
                    value: '',
                    operation: 'isNull' as XOperation}]}).pipe((x: any) => {
      return x;
    });

  checkedRows: XTableRow[] = [];
  query: any = { filter: [] };
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    private service: OntologyService,
    public override indexService: IndexService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  action(type: string, row?: any) {
    switch (type) {
      case 'add':
        this.router.navigate(['./add'], { relativeTo: this.activatedRoute });
        break;
      case 'edit':
        this.router.navigate(['./edit', row.id], { relativeTo: this.activatedRoute });
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除本体：${row.name}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
              this.service.delete(row.id).subscribe(() => {
                this.message.success('删除成功！');
              });
          },
        });
        break;
      case 'info':
        // 可扩展为详情页
        break;
    }
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

  headCheckboxChange(headCheckbox: any) {
    const checked = headCheckbox.checkbox['checked'];
    for (let row of headCheckbox.rows) {
      this.setCheckedRows(checked, row);
    }
  }

  bodyCheckboxChange(row: XTableRow) {
    this.setCheckedRows(row['checked'], row);
  }
}