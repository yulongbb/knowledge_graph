import { PageBase } from 'src/share/base/base-page';
import { Component, signal, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XGuid, XMessageBoxAction, XMessageBoxService, XQuery, XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow } from '@ng-nest/ui';
import { ExtractionService } from './extraction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, tap } from 'rxjs';
import { PropertyService } from '../ontology/property/property.service';
import { EsService } from '../search/es.service';


@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss'],
})
export class ExtractionComponent extends PageBase {

  index = 1;
  keyword: any = '';
  query: XQuery = { filter: [] };
  properties: any;
  properties2: any = signal([]);
  items: any = signal([]);

  activated = signal(0);
  steps = signal(['数据解析', '知识录入', '属性配置']);

  pre() {
    this.activated.update((x) => --x);
  }

  next() {
    this.activated.update((x) => ++x);
  }

  done() { }

  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, query).pipe(
      tap((x) => {
        console.log(x.list)

        let result: any = []
        let properties = new Set();
        let items = new Set();
        x.list?.forEach((e: any) => {
          properties.add(e.property);
          items.add(e.subject);
        })
        let arr: any = [];
        properties.forEach((p: any) => {
          arr.push(this.propertyService.getPropertyByName(p))
        })
        forkJoin(arr).subscribe((data: any) => {
          data.forEach((ds: any) => {
            ds.forEach((d: any) => {
              result.push(d);
            })
          })
          console.log(items)
          this.properties = result;
          this.properties2 = signal(properties);
          this.items = signal(items);
        })

      }),
      map((x) => x)

    );
  checkedRows: XTableRow[] = [];

  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'index', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'actions', label: '操作', width: 100 },
    { id: 'subject', label: '实体', flex: 1, sort: true },
    { id: 'property', label: '属性', flex: 0.5, sort: true },
    { id: 'object', label: '值', flex: 1 },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    public override indexService: IndexService,
    private service: ExtractionService,
    private propertyService: PropertyService,
    private esService: EsService,

    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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
      case 'parse':
        console.log(JSON.parse(this.keyword));
        let row = JSON.parse(this.keyword);
        let subject = row['名称'];
        let arr: any = [];
        Object.keys(row).map((property) => {
          arr.push(this.service.post({ id: XGuid(), subject: subject, property: property, object: row[property] }))
        })

        forkJoin(arr).subscribe((x) => {
          console.log(x)
          this.message.success('解析成功！');
        });

        break;
      case 'upload':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将：${this.checkedRows.length}条数据推送融合，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {

              let arr: any = [];
              let query = { "must": [{ "term": { "labels.zh.value.keyword": this.checkedRows[0]['subject'] } },] }

              console.log(query)
              this.esService.searchEntity(1, 10, query).subscribe((e: any) => {
                console.log(e.list[0]._source);
                let edges: any = []
                this.checkedRows.forEach((row: any) => {
                  let property = this.properties.filter((p: any) => p.name == row.property)[0];
                  let datavalue: any;
                  if (property.type == 'string') {
                    datavalue = {
                      value: row.object,
                      type: "string"
                    }
                  } else if (property.type == 'quantity') {
                    datavalue = {
                      value: {
                        amount: row.object,
                        unit: "1",
                        upperBound: null,
                        lowerBound: null
                      },
                      type: "quantity"
                    }
                  } else if (property.type == 'wikibase-item') {
                    datavalue = {
                      value: {
                        label: row.object
                      },
                      type: "wikibase-entityid"
                    }
                  } else if (property.type == 'time') {
                    datavalue = {
                      value: {
                        time: row.object,
                      },
                      type: "time"
                    }
                  }
                  let edge = {
                    _from: 'entity/' + e.list[0]['_id'],
                    mainsnak: {
                      snaktype: "value",
                      property: `P${property.id}`,
                      datavalue: datavalue,
                      datatype: property.type,
                      label: property.name
                    },
                    rank: "normal",
                    type: "statement",
                  }
                  edges.push(edge);
                  // arr.push(this.edgeService.addEdge(edge));

                })
                console.log(edges)
                forkJoin(arr).subscribe((resulet: any) => {
                  console.log(resulet)

                })
              })



            }

            // this.fusionService.fusion(this.checkedRows).subscribe(() => {
            //   this.tableCom.change(this.index);
            //   this.message.success('融合成功！');
            // });
          },
        });
        break;
      case 'delete':
        if (this.checkedRows.length > 0) {
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除此条数据，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              action === 'confirm' && this.checkedRows.forEach((item) => {
                this.service.delete(item.id).subscribe(() => {
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
                this.service.delete(item.id).subscribe(() => {
                  this.tableCom.change(this.index);
                  this.message.success('删除成功！');
                });
            },
          });
        }

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
