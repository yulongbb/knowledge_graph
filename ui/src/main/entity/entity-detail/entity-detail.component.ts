import { ChangeDetectionStrategy, Component, OnInit, Query, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from '../entity.service';
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
    { control: 'input', id: '_key',  label: 'ID',
      required: false,  }
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
    let item: any = {};
    item['label'] = $event.body.name;
    this.form.formGroup.patchValue(item);
    console.log('uploadSuccess', $event);
  }
  trustUrl(url: string) {

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);

  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.esService.getEntity(this.id).subscribe((x) => {
          this.item = x._source;
          console.log(this.item)
          this.form.formGroup.patchValue({ id: x._id, label: this.item.labels.zh.value, type: { id: 'Q5', label: '人物' }, description: this.item.descriptions.zh.value });
          this.ontologyService.getAllParentIds(this.item.type).subscribe((parents: any) => {
            console.log(parents)
            parents.push(this.item.type)
            this.propertyService.getList(1, 20, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }] }).subscribe((x: any) => {
              this.nodeService.getLinks(1, 20, this.id, {}).subscribe((data: any) => {
                console.log(data.list)

                let control: any = []
                x.list.forEach((property: any) => {
                  control.push(
                    {
                      _key: '123',
                      control: 'input',
                      id: `P${property.id}`,
                      label: property.name,
                      value: (data.list.filter((statement: any) => statement.mainsnak.property == `P${property.id}`))[0]?.mainsnak?.datavalue?.value
                    },
                  )
                });
                this.controls2 = signal<XControl[]>(control);
              })
            });
          });
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        let item: any = {
          _key:  this.form.formGroup.value._key,
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
          type: this.form.formGroup.value.type
        }

        if (this.type === 'add') {

          this.nodeService.post(item).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/entity']);
          });
        } else if (this.type === 'edit') {


          this.nodeService.getLinks(1, 20, this.id, {}).subscribe((data: any) => {
            console.log(data.list)
            let existingEdges = data.list;
            //更新边
            const updatedEdges: any = [];
            //删除边
            const deletedEdges: any = [];
            //新增边
            const newEdges: any = [];

            Object.keys(this.form2.formGroup.value).forEach((key) => {
              const value = this.form2.formGroup.value[key];
              const existingEdge = existingEdges.find((edge: any) => edge.mainsnak.property === key && this.form2.formGroup.value[edge.mainsnak.property] != '');

              if (existingEdge) {
                if (existingEdge.mainsnak.datavalue.value !== value) {
                  // 值发生变化，进行更新
                  existingEdge.mainsnak.datavalue.value = value;
                  updatedEdges.push(existingEdge);
                }
              } else if (value !== undefined && value !== '') {
                // 新增的边
                let newEdge = {
                  "_from": this.item.items[0],
                  "_to": this.item.items[0],
                  "mainsnak": {
                    "snaktype": "value",
                    "property": key,
                    "hash": "8f7599319c8f07055134a500cf67fc22d1b3142d", // 哈希值部分可以根据需要生成
                    "datavalue": {
                      "value": value,
                      "type": typeof value === 'string' ? 'string' : 'wikibase-entityid'
                    },
                    "datatype": typeof value === 'string' ? 'string' : 'wikibase-item'
                  },
                  "type": "statement",
                  "rank": "normal"
                };
                newEdges.push(newEdge);
              }
            });

            // 查找需要删除的边
            existingEdges.forEach((edge: any) => {
              if (!this.form2.formGroup.value.hasOwnProperty(edge.mainsnak.property) || this.form2.formGroup.value[edge.mainsnak.property] == '') {
                if (edge.mainsnak.property != 'P31') {
                  deletedEdges.push(edge);
                }
              }
            });

            console.log(updatedEdges)
            console.log(deletedEdges)
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



            this.message.success('修改成功！');
            this.router.navigate(['/index/entity']);
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