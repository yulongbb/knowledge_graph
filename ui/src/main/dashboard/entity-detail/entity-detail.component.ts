import { ChangeDetectionStrategy, Component, Input, OnInit, Query, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from 'src/main/search/es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { X_DIALOG_DATA, XDialogRef, XDialogService, XImagePreviewComponent } from '@ng-nest/ui';
import { EntityService } from 'src/main/entity/entity.service';
import { TagService } from 'src/main/ontology/tag/tag.sevice';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetailComponent implements OnInit {
  es: string = 'entity';
  data = inject(X_DIALOG_DATA);
  dialogRef = inject(XDialogRef<EntityDetailComponent>);


  knowledge: string = '';

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




  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;

  imgs: any;

  tags: Map<string, Array<string>> | undefined;


  tag = [];
  images: any;
  videos: any;
  pdfs: any;
  entity: any;
  claims: any;
  properties: any;
  constructor(
    private sanitizer: DomSanitizer,
    private esService: EsService,
    private nodeService: EntityService,
    public tagService: TagService,
    private ontologyService: OntologyService,
    public propertyService: PropertyService,
    private dialogSewrvice: XDialogService,
    private message: XMessageService
  ) {

  }

  ngOnInit(): void {
    this.action(this.data.type);


  }
  uploadSuccess($event: any) {
    console.log(this.imgs)
    this.imgs[this.imgs.length - 1] =
      { "url": `http://localhost:9000/kgms/${$event.body.name}` }

  }
  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


  action(type: string) {
    switch (type) {
      case 'info':
        if (this.data.id) {
          this.esService.getEntity(this.data.id).subscribe((x) => {
            console.log(x);
            this.entity = signal(x);
            this.item = x._source;
            this.imgs = [];
            this.tag = this.item?.tags;
            this.item?.images?.forEach((image: any) => {
              this.imgs.push({ url: `http://localhost:9000/kgms/${image}` })
            })
            this.ontologyService.get(x._source.type).subscribe((type: any) => {
              console.log(type);
              this.tagService.getList(1, 50, { filter: [{ field: 'id', value: type.id, relation: 'schemas', operation: '=' }] }).subscribe((data: any) => {
                let tags: any = {};
                data.list.forEach((tag: any) => {
                  tags[tag.type] = tags[tag.type] ?? [];
                  tags[tag.type].push(tag.name);
                })
                this.tags = tags;
              })
              if (this.data.type == 'edit') {
                this.form.formGroup.patchValue({ _key: x?._id, label: this.item?.labels?.zh?.value, type: { id: type?.id, label: type?.name }, description: this.item.descriptions?.zh?.value });
              }
              this.ontologyService.getAllParentIds(this.item.type).subscribe((parents: any) => {
                parents.push(this.item.type)

                this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }] }).subscribe((x: any) => {
                  console.log(x.list);
                  this.properties = signal(x.list);
                  this.nodeService.getLinks(1, 50, this.data.id, {}).subscribe((c: any) => {
                    console.log(c);
                    let statements: any = [];
                    console.log(c.list)
                    c.list.forEach((p: any) => {
                      if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                        p.edges[0].mainsnak.label = x.list.filter((l: any) => l.id == p.edges[0].mainsnak.property.replace('P', ''))[0]?.name;

                        p.edges[0].mainsnak.datavalue.value.id = p.vertices[1]?.id;
                        p.edges[0].mainsnak.datavalue.value.label = p.vertices[1]?.labels?.zh?.value;
                      }
                      statements.push(p.edges[0])
                    })
                    this.claims = statements;


                    this.statements = [];

                    c.list.forEach((p: any) => {
                      if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                        p.edges[0].mainsnak.label = x.list.filter((l: any) => l.id == p.edges[0].mainsnak.property.replace('P', ''))[0]?.name;
                        p.edges[0].mainsnak.datavalue.value.id = p.vertices[1]?.id;
                        p.edges[0].mainsnak.datavalue.value.label = p.vertices[1]?.labels?.zh?.value;
                      }
                      this.statements.push(p.edges[0])
                    })

                    x.list.forEach((property: any) => {
                      if (c.list.filter((p: any) => `P${property.id}` == p.edges[0].mainsnak.property).length == 0) {
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
                          if (statement?.mainsnak?.datavalue?.type == 'string') {
                            control.push(
                              {
                                control: 'input',
                                id: statement?._id,
                                label: statement?.mainsnak?.label,
                                value: statement?.mainsnak?.datavalue?.value
                              },
                            )
                          } else if (statement?.mainsnak?.datavalue?.type == 'quantity') {
                            control.push(
                              {
                                control: 'input',
                                id: statement?._id,
                                label: statement?.mainsnak?.label,
                                value: statement?.mainsnak?.datavalue?.value?.amount
                              },
                            )
                          } else if (statement?.mainsnak?.datavalue?.type == 'time') {
                            control.push(
                              {
                                control: 'input',
                                id: statement?._id,
                                label: statement?.mainsnak?.label,
                                value: statement?.mainsnak?.datavalue?.value?.time
                              },
                            )
                          } else if (statement?.mainsnak?.datavalue?.type == 'commonsMedia') {
                            control.push(
                              {
                                control: 'select',
                                id: 'selectRequired',
                                label: 'required',
                                span: 8,
                                data: this.imgs,
                                required: true
                              },
                            )
                          }
                        } else {
                          if (statement?.mainsnak?.datatype == 'string') {
                            control.push(
                              {
                                control: 'input',
                                id: statement?.mainsnak?.property,
                                label: statement?.mainsnak?.label,
                                value: statement?.mainsnak?.datavalue?.value
                              },
                            )
                          } else if (statement?.mainsnak?.datatype == 'quantity') {
                            control.push(
                              {
                                control: 'input',
                                id: statement?.mainsnak?.property,
                                label: statement?.mainsnak?.label,
                                value: statement?.mainsnak?.datavalue?.value?.amount
                              },
                            )
                          } else if (statement?.mainsnak?.datatype == 'time') {
                            control.push(
                              {
                                control: 'input',
                                id: statement?.mainsnak?.property,
                                label: statement?.mainsnak?.label,
                                value: statement?.mainsnak?.datavalue?.value?.time
                              },
                            )
                          }
                        }
                      }
                    })
                    this.controls2 = signal<XControl[]>(control);
                  })
                });
              });
            });
            this.images = x?._source?.images.filter((image: any) => image?.split('.')[image.split('.').length - 1] != 'mp4' && image?.split('.')[image.split('.').length - 1] != 'pdf');
            this.videos = x?._source?.images.filter((image: any) => image?.split('.')[image.split('.').length - 1] == 'mp4');
            this.pdfs = x?._source?.images.filter((image: any) => image?.split('.')[image.split('.').length - 1] == 'pdf');
          });
        }

        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        let item: any = {
          _key: this.form.formGroup.value._key,
          tags: this.tag,
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
        console.log(item)
        if (this.data.type === 'add') {
          this.nodeService.post(item).subscribe((x: any) => {
            console.log(x);
            this.message.success('新增成功！');
            this.data.cy.add({
              data: {
                id: x.items[0].index._id, label: item.labels.zh.value
              }
            })
            this.dialogRef.close();

          });
        } else if (this.data.type === 'edit') {
          this.nodeService.getLinks(1, 20, this.data.id, {}).subscribe((c: any) => {
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
                let statement = this.statements.filter((statement: any) => statement.mainsnak.property == key)[0]
                statement['_from'] = this.item.items[0];
                statement['_to'] = this.item.items[0];
                if (statement.mainsnak.datavalue.type == 'string') {
                  statement.mainsnak.datavalue.value = value;
                } else if (statement.mainsnak.datavalue.type == 'time') {
                  statement.mainsnak.datavalue.value.time = value;
                } else if (statement.mainsnak.datatype == 'quantity') {
                  statement.mainsnak.datavalue.value.amount = value;
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

            // const requests: any = [];

            // // 执行更新操作
            // updatedEdges.forEach((edge: any) => {
            //   requests.push(this.nodeService.updateEdge(edge));
            // });

            // // 执行删除操作
            // deletedEdges.forEach((edge: any) => {
            //   requests.push(this.nodeService.deleteEdge(edge._key));
            // });

            // // 执行新增操作
            // newEdges.forEach((edge: any) => {
            //   requests.push(this.nodeService.addEdge(edge));
            // });

            // //并行执行所有请求
            // forkJoin(requests).subscribe(() => {
            //   this.message.success('编辑成功！');
            // });

            item.id = this.data.id;
            item['_key'] = this.item.items[0].split('/')[1];
            item['items'] = this.item.items;

            console.log(item)

            this.nodeService.put(item).subscribe((x) => {
              this.message.success('编辑成功！');
              this.dialogRef.close();

            });

          });

        }
        break;
      case 'cancel':
        this.dialogRef.close();

        break;
    }
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
          amount: "",
          unit: "1",
          upperBound: null,
          lowerBound: null
        };
        emptyDatavalue.type = "quantity";
        break;

      case 'time':
        emptyDatavalue.value = {
          time: "",
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

  preview(image: any) {
    this.dialogSewrvice.create(XImagePreviewComponent, {
      width: '100%',
      height: '100%',
      className: 'x-image-preview-portal',
      data: [
        {
          src: 'http://localhost:9000/kgms/' + image
        }
      ]
    });
  }

  linkifyText(text: string, entities: any): string {
    const wikidataBaseUrl = 'http://localhost:4200/index/search/info/';
    // 简单示例，将“爱因斯坦”替换为指向Wikidata的链接
    console.log(entities)
    let entityMap: any = new Map();
    entities.forEach((entity: any) => {
      entityMap[entity.word] = entity.id;
    })
    Object.keys(entityMap).forEach(key => {
      const link = `<a href="${wikidataBaseUrl}${entityMap[key]}" >${key}</a>`;
      text = text.replace(new RegExp(key, 'g'), link);
    });
    return text;
  }


  getStatement(property: any): any {
    return this.claims.filter((c: any) => c.mainsnak.property == `P${property.id}`);
  }
}


interface Datavalue {
  value: any;
  type: string;
}