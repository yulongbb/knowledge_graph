import { ChangeDetectionStrategy, Component, Input, OnInit, Query, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { XDialogService, XImagePreviewComponent, XTableColumn } from '@ng-nest/ui';
import { map } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from '../es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { NavService } from 'src/services/nav.service';
import { EntityService } from 'src/main/entity/entity.service';
import { Statement } from '@angular/compiler';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationDetailComponent implements OnInit {
  id: string = '';
  knowledge: string = '';
  type: string = '';
  schema: string = '';

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

  entity: any;
  properties: any;

  images: any;
  videos: any;
  pdfs: any;

  public myOptions: NgxMasonryOptions = {
    gutter: 0,
    fitWidth: false,
    resize: false
  };

  constructor(
    private sanitizer: DomSanitizer,
    private ontologyService: OntologyService,
    private service: EsService,
    private entityService: EntityService,
    public propertyService: PropertyService,
    private activatedRoute: ActivatedRoute,
    public nav: NavService,
    private dialogSewrvice: XDialogService
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
    this.service.getEntity(this.id).subscribe((x) => {
      this.ontologyService.get(x._source.type).subscribe((t: any) => {
        x._type = t.label
        this.entity = signal(x);
        this.ontologyService.getAllParentIds(x['_source'].type).subscribe((parents: any) => {
          parents.push(x['_source'].type)
          this.propertyService.getList(1, 50, { filter: [{ field: 'id', value: parents as string[], relation: 'schemas', operation: 'IN' }] }).subscribe((p: any) => {
            this.properties = signal(p.list);
            this.entityService.getLinks(1, 50, this.id, {}).subscribe((c: any) => {
              let statements: any = [];
              console.log(c.list)
              c.list.forEach((p: any) => {
                if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                  p.edges[0].mainsnak.datavalue.value.id = p.vertices[1]?.id;
                  p.edges[0].mainsnak.datavalue.value.label = p.vertices[1]?.labels?.zh?.value;
                }
                statements.push(p.edges[0])
              })
              let claims:any = {}
              statements.forEach((statement:any)=>{
                if(!claims[statement.mainsnak.property]){
                  claims[statement.mainsnak.property] = []
                }
                claims[statement.mainsnak.property].push(statement);
              })
              this.claims = signal(claims)
            })
          });
        });
      })
      this.images = x?._source?.images.filter((image: any) => image?.split('.')[image.split('.').length - 1] != 'mp4' && image?.split('.')[image.split('.').length - 1] != 'pdf');
      this.videos = x?._source?.images.filter((image: any) => image?.split('.')[image.split('.').length - 1] == 'mp4'); 
      this.pdfs = x?._source?.images.filter((image: any) => image?.split('.')[image.split('.').length - 1] == 'pdf');
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

  uploadSuccess($event: any) {
    let item: any = {};
    item['label'] = $event.body.name;
    this.form.formGroup.patchValue(item);
    console.log('uploadSuccess', $event);
  }

  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getClaim(claim:any){
    return claim.value?.filter((c: any) => c.mainsnak.property != `P31`);
  }


  getQualify(qualify:any){
    return qualify.value;

  }

  back() {
    window.history.back();
  }
}
