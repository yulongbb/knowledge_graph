import { ChangeDetectionStrategy, Component, OnInit, Query, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { XTableColumn } from '@ng-nest/ui';
import { map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NodeService } from 'src/main/node/node.service';
import { EsService } from '../es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';

@Component({
  selector: 'app-search-detail',
  templateUrl: './search-detail.component.html',
  styleUrls: ['./search-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDetailComponent implements OnInit {
  id: string = '';
  knowledge: string = '';
  type: string = '';
  schema: string = '';
  entity: any;
  statements: any;
  properties: any;
  claims: any;
  @ViewChild('form') form!: XFormComponent;
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
      control: 'input',
      id: 'description',
      label: '描述',
      required: true,
      // pattern: /^((\+?86)|(\(\+86\)))?1\d{10}$/,
      // message: '手机号格式不正确，+8615212345678'
    },
    { control: 'input', id: 'id', hidden: true, value: XGuid() }
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
  constructor(
    private sanitizer: DomSanitizer,
    private ontologyService: OntologyService,
    private service: EsService,
    public propertyService: PropertyService,

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

    });
  }

  ngOnInit(): void {
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
        this.service.getEntity(this.id).subscribe((x) => {
          this.entity = signal(x['_source']);
          console.log(this.entity)
          this.ontologyService.getAllParentIds(x['_source'].type).subscribe((parents: any) => {
            console.log(parents)
            parents.push(x['_source'].type)
            this.propertyService.getList(1, 20, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }] }).subscribe((p: any) => {
              console.log(x.list)
              this.properties = signal(p.list);
              this.nodeService.getLinks(1, 20, x['_source']['items'][0].split('/')[1], {}).subscribe((c: any) => {
                console.log(c.list)
                this.claims = c.list;
              })
            });
          });

          // this.climas = this.nodeService.getLinks(1, 20, x['_source']['items'][0].split('/')[1], {}).pipe(
          //   tap((x: any) => console.log(x)),
          //   map((x: any) => x)
          // );
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          console.log(this.form.formGroup.value)
          this.nodeService.post(this.form.formGroup.value).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/node']);
          });
        } else if (this.type === 'edit') {
          this.nodeService.put(this.form.formGroup.value).subscribe((x) => {
            this.message.success('修改成功！');
            this.router.navigate(['/index/node']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/node']);
        break;
    }
  }

  backClick() {
    this.router.navigate([`/index/search/${this.knowledge}`], { replaceUrl: true });

  }

  getStatement(property: any): any {
    console.log(property);
    return this.claims.filter((c: any) => c.mainsnak.property == `P${property.id}`);

  }
}