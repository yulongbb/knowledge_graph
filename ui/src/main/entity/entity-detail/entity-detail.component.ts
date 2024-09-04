import { ChangeDetectionStrategy, Component, OnInit, Query, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { XTableColumn } from '@ng-nest/ui';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NodeService } from 'src/main/node/node.service';
import { EsService } from 'src/main/search/es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { EdgeService } from 'src/main/edge/edge.service';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetailComponent implements OnInit {
  id: string = '';
  knowledge: string = '';
  type: string = '';
  schema: string = '';
  item: any;
  statements: any;
  climas!: Observable<Array<any>>;
  @ViewChild('form') form!: XFormComponent;
  @ViewChild('form2') form2!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'input',
      id: 'label',
      label: '标签',
      required: true,

      // pattern: /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/,
      // message: '邮箱格式不正确，admin@ngnest.com'
    },
    {
      control: 'find',
      id: 'type',
      label: '类型',
      treeData: () =>
        this.ontologyService
          .getList(1, Number.MAX_SAFE_INTEGER, {

            sort: [
              { field: 'pid', value: 'asc' },
              { field: 'sort', value: 'asc' },
            ],
          })
          .pipe(map((x) => x.list)),

    },
    // {
    //   control: 'input',
    //   id: 'type',
    //   label: '类型',
    //   required: true,
    //   value: 'item',
    //   // pattern: /^((\+?86)|(\(\+86\)))?1\d{10}$/,
    //   // message: '手机号格式不正确，+8615212345678'
    // },
    {
      control: 'textarea',
      id: 'description',
      label: '描述',
      required: true,
      // pattern: /^((\+?86)|(\(\+86\)))?1\d{10}$/,
      // message: '手机号格式不正确，+8615212345678'
    },
    {
      control: 'input', id: '_key', label: 'ID',
      required: false,
    }
  ];

  controls2: any;


  query: any;


  columns: XTableColumn[] = [
    { id: 'index', label: '序号', width: 85, left: 0, type: 'index' },
    { id: 'property', label: '属性名', width: 200 },
    { id: 'value', label: '值', flex: 1 },
  ];

  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;

  imgs: any;

  constructor(
    private sanitizer: DomSanitizer,
    private ontologyService: OntologyService,
    private esService: EsService,
    public propertyService: PropertyService,
    private edgeService: EdgeService,
    private nodeService: NodeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看实体';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增实体';
      } else if (this.type === 'update') {
        this.title = '修改实体';
      }
      console.log(this.id)
      this.climas = this.nodeService.getLinks(1, 20, this.id, {}).pipe(
        tap((x: any) => console.log(x.list)),
        map((x: any) => x)
      );
    });
  }

  ngOnInit(): void {
    console.log(this.type);
    this.action(this.type);


  }
  uploadSuccess($event: any) {
    console.log(this.imgs)
    this.imgs[this.imgs.length - 1] =
      { "url": `http://localhost:9000/kgms/${$event.body.name}` }

    // let item: any = {};
    // item['label'] = $event.body.name;
    // this.form.formGroup.patchValue(item);
  }
  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getDatavalue(datatype: any) {
    const emptyDatavalue: Datavalue = {
      value: null,
      type: ""
    };
    switch (datatype) {
      case 'commonsMedia':
      case 'external-id':
      case 'string':
      case 'url':
      case 'math':
      case 'monolingualtext':
      case 'musical-notation':
        emptyDatavalue.value = "";
        emptyDatavalue.type = "string";
        break;

      case 'globe-coordinate':
        emptyDatavalue.value = {
          latitude: 0,
          longitude: 0,
          altitude: null,
          precision: 0,
          globe: "http://www.wikidata.org/entity/Q2" // Default to Earth
        };
        emptyDatavalue.type = "globecoordinate";
        break;

      case 'quantity':
        emptyDatavalue.value = {
          amount: "+0",
          unit: "1",
          upperBound: null,
          lowerBound: null
        };
        emptyDatavalue.type = "quantity";
        break;

      case 'time':
        emptyDatavalue.value = {
          time: "+0000-00-00T00:00:00Z",
          timezone: 0,
          before: 0,
          after: 0,
          precision: 0,
          calendarmodel: "http://www.wikidata.org/entity/Q1985727" // Default to Gregorian calendar
        };
        emptyDatavalue.type = "time";
        break;

      case 'tabular-data':
      case 'geo-shape':
        emptyDatavalue.value = {
          "entity-type": "tabular-data",
          "id": "",
          "title": ""
        };
        emptyDatavalue.type = "wikibase-entityid";
        break;

      case 'wikibase-item':
      case 'wikibase-property':
      case 'wikibase-lexeme':
      case 'wikibase-form':
      case 'wikibase-sense':
        emptyDatavalue.value = {
          "entity-type": datatype.replace('wikibase-', ''),
          "numeric-id": 0,
          "id": ""
        };
        emptyDatavalue.type = "wikibase-entityid";
        break;

      default:
        emptyDatavalue.value = null;
        emptyDatavalue.type = "unknown";
    }
    return emptyDatavalue;

  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.esService.getEntity(this.id).subscribe((x) => {
          console.log(x);
          this.item = x._source;
          this.imgs = [];
          this.item?.images?.forEach((image: any) => {
            this.imgs.push({ url: `http://localhost:9000/kgms/${image}` })
          })
          this.ontologyService.get(x._source.type).subscribe((type: any) => {
            console.log(type);
            this.form.formGroup.patchValue({ _key: x?._id, label: this.item?.labels?.zh?.value, type: { id: type?.id, label: type?.name }, description: this.item.descriptions?.zh?.value });
            this.ontologyService.getAllParentIds(this.item.type).subscribe((parents: any) => {
              parents.push(this.item.type)
              this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }] }).subscribe((x: any) => {
                this.nodeService.getLinks(1, 50, this.id, {}).subscribe((c: any) => {
                  console.log(c);
                  this.statements = [];

                  c.list.forEach((p: any) => {
                    if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                      console.log(p.edges[0].mainsnak.property)
                      p.edges[0].mainsnak.label = x.list.filter((l: any) => l.id == p.edges[0].mainsnak.property.replace('P', ''))[0]?.name;
                      p.edges[0].mainsnak.datavalue.value.id = p.vertices[1].id;
                      p.edges[0].mainsnak.datavalue.value.label = p.vertices[1].labels.zh.value;
                    }
                    this.statements.push(p.edges[0])
                  })
                  x.list.forEach((property: any) => {
                    if(c.list.filter((p:any)=>`P${property.id}`==p.edges[0].mainsnak.property ).length==0){
                      this.statements.push({
                        "mainsnak": {
                          "snaktype": "value",
                          "property": `P${property.id}`,
                          "datavalue": this.getDatavalue(property.type),
                          "datatype": property.type,
                          "label": property.name,
                        },
                        "type": "statement",
                        "rank": "normal"
                      }
                      )
                    }
                    
                  })
                  let control: any = []
                  this.statements = this.statements.sort((a: any, b: any) => {
                    return a.mainsnak.label === b.mainsnak.label ? 0 : a.mainsnak.label > b.mainsnak.label ? 1 : -1;
                  });
                  console.log(this.statements)

                  this.statements.forEach((statement: any) => {
                    if (statement.mainsnak.property != 'P31') {
                      if (statement._id) {
                        if (statement.mainsnak.datavalue.type == 'string') {
                          control.push(
                            {
                              control: 'input',
                              id: statement?._id,
                              label: statement?.mainsnak?.label,
                              value: statement?.mainsnak?.datavalue?.value
                            },
                          )
                        } else if (statement.mainsnak.datavalue.type == 'quantity') {
                          control.push(
                            {
                              control: 'input',
                              id: statement?._id,
                              label: statement?.mainsnak?.label,
                              value: statement?.mainsnak?.datavalue?.value?.amount
                            },
                          )
                        } else if (statement.mainsnak.datavalue.type == 'time') {
                          control.push(
                            {
                              control: 'input',
                              id: statement?._id,
                              label: statement?.mainsnak?.label,
                              value: statement?.mainsnak?.datavalue?.value?.time
                            },
                          )
                        } else {
                          control.push(
                            {
                              control: 'input',
                              id: statement?._id,
                              label: statement?.mainsnak?.label,
                              value: statement?.mainsnak?.datavalue?.value?.label
                            },
                          )
                        }
                      } else {
                        control.push(
                          {
                            control: 'input',
                            id: statement?.mainsnak?.property,
                            label: statement?.mainsnak?.label,
                            value: statement?.mainsnak?.datavalue?.value?.label
                          },
                        )
                      }
                    }
                  })

                  this.controls2 = signal<XControl[]>(control);
                })
              });
            });
          })
          // 填充基本信息表单

        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        let item: any = {
          _key: this.form.formGroup.value._key,
          labels: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.label
            }
          },
          descriptions: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.description
            }
          },
          type: this.form.formGroup.value.type,
          images: this.imgs?.map((i: any) => i.url.split('/')[i.url.split('/').length - 1])
        }
        console.log(this.item)
        if (this.type === 'add') {
          this.nodeService.post(item).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/entity']);
          });
        } else if (this.type === 'edit') {
          this.nodeService.getLinks(1, 20, this.id, {}).subscribe((c: any) => {
            let statements: any = [];
            c.list.forEach((p: any) => {
              if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                p.edges[0].mainsnak.datavalue.value.id = p.vertices[1].id;
                p.edges[0].mainsnak.datavalue.value.label = p.vertices[1].labels.zh.value;
              }
              statements.push(p.edges[0])
            })
            let existingEdges = statements;
            //更新边
            const updatedEdges: any = [];
            //删除边
            const deletedEdges: any = [];
            //新增边
            const newEdges: any = [];
            Object.keys(this.form2.formGroup.value).forEach((key) => {
              const value = this.form2.formGroup.value[key];

              const existingEdge = existingEdges.find((edge: any) => edge._id === key && this.form2.formGroup.value[edge._id] != '');
              if (existingEdge) {
                if (existingEdge.mainsnak.datavalue.type == 'string') {
                  if (existingEdge.mainsnak.datavalue.value !== value) {
                    // 值发生变化，进行更新
                    existingEdge.mainsnak.datavalue.value = value;
                    updatedEdges.push(existingEdge);
                  }
                } else {
                  if (existingEdge.mainsnak.datavalue.value.label !== value) {
                    // 值发生变化，进行更新
                    existingEdge.mainsnak.datavalue.value.label = value;
                    updatedEdges.push(existingEdge);
                  }
                }
              } else if (value !== undefined && value !== '') {
                // 新增的边
                console.log(value)
                let statement = this.statements.filter((statement: any) => statement.mainsnak.property == key)[0]
                statement['_from'] = this.item.items[0];
                statement['_to'] = this.item.items[0];
                if (statement.mainsnak.datatype == 'string') {
                  statement.mainsnak.datavalue.value = value;
                } else if (statement.mainsnak.datatype == 'quantity') {
                  statement.mainsnak.datavalue.value.amount = value;
                } else if (statement.mainsnak.datatype == 'wikibase-item') {
                  statement.mainsnak.datavalue.value.label = value;
                }
                newEdges.push(statement);
              }
            });
            // 查找需要删除的边
            existingEdges.forEach((edge: any) => {
              if (!this.form2.formGroup.value.hasOwnProperty(edge._id) || this.form2.formGroup.value[edge._id] == '') {
                if (edge.mainsnak.property != 'P31') {
                  deletedEdges.push(edge);
                }
              }
            });
            console.log('更新')
            console.log(updatedEdges)
            console.log('删除')
            console.log(deletedEdges)
            console.log('新增')
            console.log(newEdges)

            const requests: any = [];

            // 执行更新操作
            updatedEdges.forEach((edge: any) => {
              requests.push(this.edgeService.updateEdge(edge));
            });

            // 执行删除操作
            deletedEdges.forEach((edge: any) => {
              requests.push(this.edgeService.deleteEdge(edge._key));
            });

            // 执行新增操作
            newEdges.forEach((edge: any) => {
              requests.push(this.edgeService.addEdge(edge));
            });

            // 并行执行所有请求
            forkJoin(requests).subscribe(() => {
              this.message.success('编辑成功！');
              this.router.navigate(['/index/entity']);
            });

            item.id = this.id;
            item['_key'] = this.id;
            item['items'] = this.item.items;

            console.log(item)

            this.nodeService.put(item).subscribe((x) => {
              this.message.success('编辑成功！');
              this.router.navigate(['/index/entity']);
            });

          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/entity']);
        break;
    }
  }

  backClick() {
    this.router.navigate([`/index/entity/${this.knowledge}`], { replaceUrl: true });
  }
}


interface Datavalue {
  value: any;
  type: string;
}