import { PageBase } from 'src/share/base/base-page';
import { Component, signal, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XGuid, XMessageBoxAction, XMessageBoxService, XQuery, XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow } from '@ng-nest/ui';
import { ExtractionService } from './extraction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, tap } from 'rxjs';
import { PropertyService } from '../ontology/property/property.service';
import { NodeService } from '../node/node.service';
import { EdgeService } from '../edge/edge.service';


@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss'],
})
export class ExtractionComponent extends PageBase {

  index = 1;
  keyword: any = '{ "名称" : "歼-16战机", "产国" : "中国", "图片" : "http://images.huanqiu.com/sarons/2014/05/78c43ad2aad6411d2cda1328555a0bef.jpg", "简介" : "歼16沈阳飞机公司为海军航空兵所研发的一款新型多用途战机，是歼-11BS战斗机的攻击机版本（歼-11BS又是苏-27的双座版本），由于此前的歼-11BS双座战斗机的外挂架数量和挂载能力偏低，主要用于对空作战，因而对地、对海攻击能力有限。  结合了俄制苏-30MKK战斗机的机身和空中格斗能力，以及西安产歼轰-7A歼击轰炸机的通用弹药，在载弹种类、数量上将超越中国现役的同类机型，推测其可以挂载除战略武器以外的所有空基发射武器，将具备远距离超视距攻击能力和强大的对地、对海打击能力。   2013年，网上也曝出一组关于歼-16携霹雳-13惊艳亮相的图片，引发外界强烈关注。分析称，该新型导弹搭档中国歼-16，战力大增，一旦上战场作战，击沉美军航母也不是不可能。", "首飞时间" : "2011年10月17日", "研发单位" : "中国沈阳飞机公司", "气动布局" : "后掠翼", "发动机数量" : "双发", "飞行速度" : "超音速", "关注度" : "(5分)", "乘员" : "2人", "机长" : "21.19米", "翼展" : "14.7米", "机高" : "5.9米", "发动机" : "AL-31F涡扇发动机", "最大飞行速度" : "1438千米每小时", "最大航程" : "4288千米", "大类" : "飞行器", "类型" : "战斗机" }';
  query: XQuery = { filter: [] };
  properties: any;
  properties2: any = signal([]);
  items: any = signal([]);

  activated = signal(0);
  steps = signal(['数据解析', '属性配置', '知识录入']);

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
          console.log(result)
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
    private nodeService: NodeService,
    private edgeService: EdgeService,

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
              let item: any = {
                labels: {
                  zh: {
                    language: 'zh',
                    value: this.checkedRows[0]['subject']
                  }
                },
                type: { 'id': 'E4' },
              }
              let arr: any = [];
              this.nodeService.post(item).subscribe((i: any) => {
                console.log(i);
                let edges: any = []
                this.checkedRows.forEach((row: any) => {
                  let property = this.properties.filter((p: any) => p.name == row.property)[0];
                  let datavalue: any;
                  if (property == 'string') {
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
                    _from: 'entity/' + i.items[0]['index']['_id'],
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
                  arr.push(this.edgeService.addEdge(edge));

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
