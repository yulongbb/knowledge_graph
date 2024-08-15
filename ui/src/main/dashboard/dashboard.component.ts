import { Component, OnDestroy, OnInit, Query, ViewChild, signal } from '@angular/core';
import { OntologyService, Schema } from '../ontology/ontology/ontology.service';
import { Observable, delay, forkJoin, map, of, tap, timeInterval } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { XFormRow, XMessageBoxAction, XMessageBoxService, XMessageService, XTableColumn, XTableComponent, XTreeAction, XTreeComponent } from '@ng-nest/ui';
import { IndexService } from 'src/layout/index/index.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { NodeService } from '../node/node.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit, OnDestroy {
  total: any = 0;
  numbers: any = [];
  diskData = [
    {
      "value": 40,
      "name": "其他",
      "path": "其他"
    }];

  chartOptions: any;

  value: any;

  query = { keyword: '' }

  data1: any;


  index = 1;
  size = 20;
  total1 = 0;
  data2 = signal<any[]>([]);
  columns: XTableColumn[] = [
    { id: 'label', label: '标签', flex: 1.5, sort: true },
    { id: 'description', label: '描述', flex: 2, sort: true },
  ];

  items = (index: number, size: number, query: Query) =>
    this.nodeService
      .getList(index, this.size, { collection: 'entity', keyword: `%${this.keyword}%` })
      .pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );

  unifyNumber(num: any) {
    if (num === '') {
      return 0
    } else {
      let handleNum = parseFloat(num)
      let isToFixed = handleNum.toString().includes('.') && handleNum.toString().split('.')[1].length > 2
      if (isToFixed) {
        return handleNum.toFixed(2)
      } else {
        return handleNum
      }
    }
  }

  data = () =>
    this.service
      .getList(1, Number.MAX_SAFE_INTEGER, {
        sort: [
          { field: 'pid', value: 'asc' },
          { field: 'sort', value: 'asc' },
        ],
      })
      .pipe(
        tap((x: any) => console.log(x)),
        map((x) => x.list)
      );
  id: any;
  keyword: any = '';

  @ViewChild('treeCom') treeCom!: XTreeComponent;

  formGroup = new UntypedFormGroup({});

  get disabled() {
    return !['edit', 'add', 'add-root'].includes(this.type);
  }

  type = 'info';

  selected!: Schema;
  treeLoading = true;

  @ViewChild('tableCom') tableCom!: XTableComponent;

  selectedRow: any;
  climas!: Observable<Array<any>>;
  entities: any = signal([]);

  constructor(
    private service: OntologyService, private dashboardService: DashboardService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService,
    private nodeService: NodeService,

  ) {
  }

  ngOnDestroy(): void {
    // clearInterval(this.timer); // 清除定时器
  }

  treeActions: XTreeAction[] = [
    {
      id: 'add',
      label: '新增',
      icon: 'fto-plus-square',
      handler: (schema: Schema) => {
        this.action('add', schema);
      },
    },
    {
      id: 'edit',
      label: '修改',
      icon: 'fto-edit',
      handler: (schema: Schema) => {
        this.action('edit', schema);
      },
    },
    {
      id: 'properties',
      label: '属性',
      icon: 'fto-list',
      handler: (schema: Schema) => {
        this.action('properties', schema);
      },
    },
    {
      id: 'delete',
      label: '删除',
      icon: 'fto-trash-2',
      handler: (schema: Schema) => {
        this.action('delete', schema);
      },
    },
  ];


  controls: XFormRow[] = [
    {
      controls: [
        {
          control: 'input',
          id: 'id',
          label: 'id',
          required: true,
        },
        {
          control: 'input',
          id: 'name',
          label: '名称',
          required: true,
        },
        {
          control: 'input',
          id: 'label',
          label: '标签',
        },
        { control: 'input', id: 'description', label: '描述' },
        { control: 'input', id: 'collection', label: '表' },
      ],
    },
    {
      hidden: true,
      controls: [
        // {
        //   control: 'input',
        //   id: 'id',
        // },
        {
          control: 'input',
          id: 'pid',
        },
      ],
    },
  ];


  action(type: string, schema: Schema) {
    console.log(schema);
    switch (type) {
      case 'add-root':
        console.log(schema);
        this.selected = schema;
        this.type = type;
        this.formGroup.reset();
        this.formGroup.patchValue({
          // id: XGuid(),
          pid: null,
        });
        break;
      case 'add':
        this.selected = schema;
        this.type = type;
        this.formGroup.reset();
        console.log(schema);
        this.formGroup.patchValue({
          // id: XGuid(),
          pid: schema.id,
        });
        break;
      case 'save':
        if (this.type === 'add' || this.type === 'add-root') {
          console.log(this.formGroup.value);
          this.service.post(this.formGroup.value).subscribe((x) => {
            this.type = 'info';
            console.log(x);
            this.treeCom.addNode(x);
            this.message.success('新增成功！');
          });
        } else if (this.type === 'edit') {
          console.log(this.formGroup.value);
          this.service.put(this.formGroup.value).subscribe(() => {
            this.type = 'info';
            this.treeCom.updateNode(schema, this.formGroup.value);
            this.message.success('修改成功！');
          });
        }
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${schema.label}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
              this.service.delete(schema.id).subscribe(() => {
                console.log(schema);
                this.treeCom.removeNode(schema);
                this.formGroup.reset();
                this.message.success('删除成功！');
              });
          },
        });
        break;
      case 'edit':
        this.selected = schema;
        this.type = type;
        this.service.get(schema?.id).subscribe((x) => {
          this.formGroup.patchValue(x);
        });
        break;
      case 'properties':
        this.router.navigate([`./properties/${schema.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
    }
  }

  selectRow(row: any) {
    this.selectedRow = row;
    console.log(row);

    // this.entities= signal([this.selectedRow.labels])
    this.climas = this.nodeService.getLinks(1, 100, row.id[0], {}).pipe(
      tap((x: any) => console.log(x)),
      map((x: any) => x)
    );
  }


  search(keyword: any) {
    this.items = (index: number, size: number, query: Query) =>
      this.nodeService.getList(index, this.size, { collection: 'entity', keyword: `%${keyword}%` }).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );

  }


  ngOnInit(): void {



    this.service.getList(1, Number.MAX_SAFE_INTEGER, {
      sort: [
        { field: 'pid', value: 'asc' },
        { field: 'sort', value: 'asc' },
      ],
    }).subscribe((data: any) => {

      this.chartOptions = {
        backgroundColor: '#555555',

        series: [
          {
            name: '信大知识体系',
            type: 'treemap',
            visibleMin: 300,
            label: {
              position: 'insideTopLeft',
              formatter: (params: any) => {
                let number = params.data.number;
                if (number && number > 10000) {
                  let new_number = number / 10000;
                  number = this.unifyNumber(new_number) + '万';
                } else {
                  number + params.value;
                }
                let arr = [
                  '{name|' + params.name + '}',
                  '{hr|}',
                  '{budget|' + number + '}',
                  '{label|' + params.data.id + '}',
                ];
                return arr.join('\n');
              },
              rich: {
                budget: {
                  fontSize: 22,
                  lineHeight: 30,
                  color: 'yellow'
                },

                label: {
                  fontSize: 9,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  borderRadius: 2,
                  padding: [2, 4],
                  lineHeight: 25,
                  align: 'right'
                },
                name: {
                  fontSize: 18,
                  color: '#fff'
                },
                hr: {
                  width: '100%',
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderWidth: 0.5,
                  height: 0,
                  lineHeight: 10
                }
              }
            },
            upperLabel: {
              show: true,
              height: 30,
              formatter: (params: any) => {
                let number = params.data.number;
                if (number && number > 10000) {
                  let new_number = number / 10000;
                  number = this.unifyNumber(new_number) + '万';
                } else {
                  number + params.value;
                }
                let arr = [
                  '{name|' + params.name + '}{budget|' + number + '}',
                ];
                return arr.join('\n');
              },
              rich: {
                budget: {
                  fontSize: 22,
                  lineHeight: 30,
                  color: 'yellow'
                },

                label: {
                  fontSize: 9,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  borderRadius: 2,
                  padding: [2, 4],
                  lineHeight: 25,
                  align: 'right'
                },
                name: {
                  fontSize: 18,
                  color: '#fff'
                },
                hr: {
                  width: '100%',
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderWidth: 0.5,
                  height: 0,
                  lineHeight: 10
                }
              }
            },
            itemStyle: {
              borderColor: '#fff'
            },
            levels: [
              {
                itemStyle: {
                  borderColor: '#777',
                  borderWidth: 0,
                  gapWidth: 1
                },
                upperLabel: {
                  show: false
                }
              },

              {
                itemStyle: {
                  borderColor: '#555',
                  borderWidth: 5,
                  gapWidth: 1
                },
                emphasis: {
                  itemStyle: {
                    borderColor: '#ddd'
                  }
                }
              },
              {
                itemStyle: {
                  borderColor: '#555',
                  borderWidth: 5,
                  gapWidth: 1
                },
                emphasis: {
                  itemStyle: {
                    borderColor: '#ddd'
                  }
                }
              },
              {
                colorSaturation: [0.35, 0.5],
                itemStyle: {
                  borderWidth: 5,
                  gapWidth: 1,
                  borderColorSaturation: 0.6
                }
              }
            ],
            data: this.buildTree(data.list)[0].children
          }
        ]


      }


      // this.treeNodeclick({ data: this.buildTree(data.list)[0] });
      // let total = 0;
      // let types: any = []
      // data.list.forEach((child: any) => {
      //   types.push({ id: child.id, name: child.name });
      // })
      // this.dashboardService.getNumber(types).subscribe((data) => {
      //   var arr: any = [];
      //   data.forEach((n: any) => {
      //     total += n.value;

      //   });
      //   data[0].value = total;
      //   data.forEach((n: any) => {
      //     if (n.value == 0) { n.value = 1 }

      //     arr.push(this.service.put(n))
      //   });
      //   forkJoin(arr).subscribe(() => { });

      // })
      // console.log(this.buildTree(data.list));

    })



  }



  buildTree(data: any) {
    let tree: any = [];
    let map: any = {};

    // 将所有节点放入map中，以便快速查找
    data.forEach((item: any) => {
      map[item.id] = { ...item, children: [] };
    });

    // 构建树
    data.forEach((item: any) => {
      if (item.pid !== null) {
        // 如果有父节点，则将其放入父节点的children数组中
        map[item.id]['number'] = map[item.id].value;
        map[item.id].value = 1
        map[item.pid]['children'].push(map[item.id]);
      } else {
        // 否则，作为根节点放入树结构中
        map[item.id]['number'] = map[item.id].value;

        map[item.id].value = 1
        tree.push(map[item.id]);
      }
    });

    return tree;
  }






  selectNumber(param: any) {

    this.id = param.id;

    // this.query = { "must": [{ "match": { "P31": this.id } }] }
    try {
      this.dashboardService.getValue(param.id).subscribe((value) => {
        console.log(value);
        this.value = value;
      })
    } catch (e: any) { }

  }

  treeNodeclick(param: any) {
    /* true 代表点击的是圆点
       fasle 表示点击的是当前节点的文本
    */


    this.id = param.data.id;

    // this.query = { "must": [{ "match": { "P31": this.id } }] }

    console.log(param.data)
    // let total = 0;
    // let types: any = []
    // types.push({ id: param.data.id, name: param.data.name });
    // param.data.children.forEach((child: any) => {
    //   types.push({ id: child.id, name: child.name });
    // })
    // this.dashboardService.getNumber(types).subscribe((data) => {

    //   var arr: any = [];
    //   data.forEach((n: any) => {
    //     total += n.value;

    //   });
    //   data.value = total;
    //   data.forEach((n: any) => {
    //     if (n.value == 0) { n.value = 1 }
    //     arr.push(this.service.put(n))
    //   });
    //   data = data.sort((a: any, b: any) => b.value - a.value);
    //   this.numbers = signal(data);
    //   try {
    //     this.dashboardService.getValue(param.data.id).subscribe((value) => {
    //       console.log(value);
    //       this.value = value;
    //     })
    //   } catch (e: any) { }



    // })
  }





  extractIdsFromTree(data: any): any[] {
    let ids: any[] = [];
    ids.push({ id: data.id, name: data.name });

    function traverse(node: any): void {
      ids.push({ id: node.id, name: node.name });
      if (node.children) {
        node.children.forEach((child: any) => traverse(child));
      }
    }

    data.children.forEach((rootNode: any) => traverse(rootNode));

    return ids;
  }



}
