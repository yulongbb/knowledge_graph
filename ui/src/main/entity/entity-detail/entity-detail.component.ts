import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import {
  XDialogService,
  XGuid,
  XImagePreviewComponent,
  XTableColumn,
  XTableRow,
} from '@ng-nest/ui';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from 'src/main/search/es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { EntityService } from '../entity.service';
import { TagService } from 'src/main/ontology/tag/tag.sevice';
import { NavService } from 'src/services/nav.service';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailComponent implements OnInit {
  id: string = '';
  knowledge: string = '';
  type: string = '';
  schema: string = '';
  item: any;

  @ViewChild('form') form!: XFormComponent;
  @ViewChild('form2') form2!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'input',
      id: '_key',
      label: 'ID',
      required: false,
    },
    {
      control: 'input',
      id: 'label',
      label: '标签',
      required: true,
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
    {
      control: 'textarea',
      id: 'description',
      label: '描述',
      required: true,
    },
  
  ];

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

  tags: Map<string, Array<string>> | undefined;

  tag: any = signal([]);
  images: any;
  videos: any;
  pdfs: any;
  entity: any;
  claims: any;

  properties: any;
  propertyData:any;

  statements: any;
  //更新边
  updatedEdges: any = [];
  //删除边
  deletedEdges: any = [];
  //新增边
  newEdges: any = [];

  columns2: XTableColumn[] = [
    { id: 'index', label: '序号', width: 85, left: 0, type: 'index' },
    { id: 'property', label: '属性名', flex: 1 },
    { id: 'name', label: '属性值', flex: 1 },
    { id: 'status', label: '编辑', width: 100 },
    { id: 'actions', label: '操作', width: 100 },
  ];

  add() {
    this.statements = [
      ...this.statements,
      {
        state: 'add',
        _from: this.item.items[0],
        mainsnak: {
          snaktype: 'value',
          property: '',
          hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
          datavalue: {
            value: '',
            type: 'string',
          },
          datatype: 'string',
        },
        type: 'statement',
        rank: 'normal',
      },
    ];
  }

  del(row: XTableRow) {
    console.log(row);
    // const index = this.data.findIndex((x) => x.id === row.id);
    // if (index >= 0) {
    //   this.data.splice(index, 1);
    // }
  }

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private dialogSewrvice: XDialogService,
    public nav: NavService,
    private ontologyService: OntologyService,
    private esService: EsService,
    public propertyService: PropertyService,
    public tagService: TagService,
    private nodeService: EntityService,
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
    });
  }

  ngOnInit(): void {
    this.action(this.type);
  }

  preview(image: any) {
    this.dialogSewrvice.create(XImagePreviewComponent, {
      width: '100%',
      height: '100%',
      className: 'x-image-preview-portal',
      data: [
        {
          src: 'http://localhost:9000/kgms/' + image,
        },
      ],
    });
  }

  change(statements: any) {
    console.log(this.propertyData().filter((p:any)=> p.name==statements.mainsnak.label)[0].type)
    switch(this.propertyData().filter((p:any)=> p.name==statements.mainsnak.label)[0].type){
      case 'url':
        statements.mainsnak.property = `P${this.propertyData().filter((p:any)=> p.name==statements.mainsnak.label)[0].id}`
        statements.mainsnak.datatype = 'url';
        statements.mainsnak.datavalue = {
          value: '',
          type: 'string',
        }
        break;
    }
    statements.mainsnak.property = `P${this.propertyData().filter((p:any)=> p.name==statements.mainsnak.label)[0].id}`
    console.log(statements);
  }

  uploadSuccess($event: any) {
    console.log(this.imgs);
    this.imgs[this.imgs.length - 1] = {
      url: `http://localhost:9000/kgms/${$event.body.name}`,
    };
  }

  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getDatavalue(datatype: any) {
    const emptyDatavalue: Datavalue = {
      value: null,
      type: '',
    };
    switch (datatype) {
      case 'commonsMedia':
      case 'external-id':
      case 'string':
      case 'url':
      case 'math':
      case 'monolingualtext':
      case 'musical-notation':
        emptyDatavalue.value = '';
        emptyDatavalue.type = 'string';
        break;

      case 'globe-coordinate':
        emptyDatavalue.value = {
          latitude: 0,
          longitude: 0,
          altitude: null,
          precision: 0,
          globe: 'http://www.wikidata.org/entity/Q2', // Default to Earth
        };
        emptyDatavalue.type = 'globecoordinate';
        break;
      case 'quantity':
        emptyDatavalue.value = {
          amount: '',
          unit: '1',
          upperBound: null,
          lowerBound: null,
        };
        emptyDatavalue.type = 'quantity';
        break;

      case 'time':
        emptyDatavalue.value = {
          time: '',
          timezone: 0,
          before: 0,
          after: 0,
          precision: 0,
          calendarmodel: 'http://www.wikidata.org/entity/Q1985727', // Default to Gregorian calendar
        };
        emptyDatavalue.type = 'time';
        break;
      case 'tabular-data':
      case 'geo-shape':
        emptyDatavalue.value = {
          'entity-type': 'tabular-data',
          id: '',
          title: '',
        };
        emptyDatavalue.type = 'wikibase-entityid';
        break;
      case 'wikibase-item':
      case 'wikibase-property':
      case 'wikibase-lexeme':
      case 'wikibase-form':
      case 'wikibase-sense':
        emptyDatavalue.value = {
          'entity-type': datatype.replace('wikibase-', ''),
          'numeric-id': 0,
          id: '',
        };
        emptyDatavalue.type = 'wikibase-entityid';
        break;
      default:
        emptyDatavalue.value = null;
        emptyDatavalue.type = 'unknown';
    }
    return emptyDatavalue;
  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.esService.getEntity(this.id).subscribe((x) => {
          this.entity = signal(x);
          this.item = x._source;
          this.imgs = [];
          this.tag = signal(this.item?.tags);
          this.item?.images?.forEach((image: any) => {
            this.imgs.push({ url: `http://localhost:9000/kgms/${image}` });
          });
          this.ontologyService.get(x._source.type).subscribe((type: any) => {
            this.tagService
              .getList(1, 500, {
                filter: [
                  {
                    field: 'id',
                    value: type.id,
                    relation: 'schemas',
                    operation: '=',
                  },
                ],
              })
              .subscribe((data: any) => {
                let tags: any = {};
                data.list.forEach((tag: any) => {
                  tags[tag.type] = tags[tag.type] ?? [];
                  tags[tag.type].push(tag.name);
                });
                this.tags = tags;
              });
            if (this.type == 'edit') {
              this.form.formGroup.patchValue({
                _key: x?._id,
                label: this.item?.labels?.zh?.value,
                type: { id: type?.id, label: type?.name },
                description: this.item.descriptions?.zh?.value,
              });
            }
            this.ontologyService
              .getAllParentIds(this.item.type)
              .subscribe((parents: any) => {
                parents.push(this.item.type);
                this.propertyService
                  .getList(1, 50, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                    ],
                  })
                  .subscribe((x: any) => {
                    console.log(x.list)
                    this.propertyData=signal(x.list) ;
                    this.properties = x.list.map((p: any) => p.name);
                    this.nodeService
                      .getLinks(1, 50, this.id, {})
                      .subscribe((c: any) => {
                        this.statements = [];
                        c.list.forEach((p: any) => {
                          if (p.edges[0].mainsnak.property != 'P31') {
                            p.edges[0].mainsnak.label = x.list.filter(
                              (p2: any) =>
                                p.edges[0].mainsnak.property == `P${p2.id}`
                            )[0]?.name;
                            if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                              console.log(p.edges[0].mainsnak.property);
                              p.edges[0].mainsnak.datavalue.value.id =
                                p.vertices[1]?.id;
                              p.edges[0].mainsnak.datavalue.value.label =
                                p.vertices[1]?.labels?.zh?.value;
                            }
                            this.statements.push(p.edges[0]);
                          }
                          this.claims = this.statements;
                        });
                      });
                  });
              });
          });
          this.images = x?._source?.images.filter(
            (image: any) =>
              image?.split('.')[image.split('.').length - 1] != 'mp4' &&
              image?.split('.')[image.split('.').length - 1] != 'pdf'
          );
          this.videos = x?._source?.images.filter(
            (image: any) =>
              image?.split('.')[image.split('.').length - 1] == 'mp4'
          );
          this.pdfs = x?._source?.images.filter(
            (image: any) =>
              image?.split('.')[image.split('.').length - 1] == 'pdf'
          );
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        console.log(this.tag());
        let item: any = {
          _key: this.form.formGroup.value._key,
          tags: this.tag(),
          labels: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.label,
            },
          },
          descriptions: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.description,
            },
          },
          type: this.form.formGroup.value.type,
          images: this.imgs?.map(
            (i: any) => i.url.split('/')[i.url.split('/').length - 1]
          ),
        };
        if (this.type === 'add') {
          this.nodeService.post(item).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/entity']);
          });
        } else if (this.type === 'edit') {
          this.nodeService.getLinks(1, 20, this.id, {}).subscribe((c: any) => {
            let statements: any = [];
            c.list.forEach((p: any) => {
              p.edges[0].state = 'info';
              if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                p.edges[0].mainsnak.datavalue.value.id = p.vertices[1].id;
                p.edges[0].mainsnak.datavalue.value.label =
                  p.vertices[1].labels.zh.value;
              }
              statements.push(p.edges[0]);
            });
            this.newEdges = this.statements.filter((s:any)=> s.state=='add');
            console.log('更新');
            console.log(this.updatedEdges);
            console.log('删除');
            console.log(this.deletedEdges);
            console.log('新增');
            console.log(this.newEdges);
            const requests: any = [];
            // 执行更新操作
            this.updatedEdges.forEach((edge: any) => {
              requests.push(this.nodeService.updateEdge(edge));
            });
            // 执行删除操作
            this.deletedEdges.forEach((edge: any) => {
              requests.push(this.nodeService.deleteEdge(edge._key));
            });
            //执行新增操作
            this.newEdges.forEach((edge: any) => {
              console.log(edge)
              requests.push(this.nodeService.addEdge(edge));
            });
            //并行执行所有请求
            forkJoin(requests).subscribe((data) => {
              console.log(data);
              // this.router.navigate(['/index/entity']);
            });
          });
          item.id = this.id;
          item['_key'] = this.item.items[0].split('/')[1];
          item['items'] = this.item.items;
          this.nodeService.put(item).subscribe((x) => {
            this.message.success('编辑成功！');
            this.router.navigate(['/index/entity']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/entity']);
        break;
    }
  }

  linkifyText(text: string, entities: any): string {
    const wikidataBaseUrl = 'http://localhost:4200/index/search/info/';
    let entityMap: any = new Map();
    entities.forEach((entity: any) => {
      entityMap[entity.word] = entity.id;
    });
    Object.keys(entityMap).forEach((key) => {
      const link = `<a href="${wikidataBaseUrl}${entityMap[key]}" >${key}</a>`;
      text = text.replace(new RegExp(key, 'g'), link);
    });
    return text;
  }

  getStatement(property: any): any {
    return this.claims.filter(
      (c: any) => c.mainsnak.property == `P${property.id}`
    );
  }

  back() {
    this.nav.back();
  }

  close($event: string | number) {
    console.log(this.tag);
    this.tag.update((x: any) => {
      x.splice(x.indexOf($event), 1);
      return [...x];
    });
  }
}

interface Datavalue {
  value: any;
  type: string;
}
