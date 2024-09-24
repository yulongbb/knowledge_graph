import { ChangeDetectionStrategy, Component, Input, OnInit, Query, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from 'src/main/search/es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDetailComponent implements OnInit {
  es:string = 'entity';

  @Input() id: string = '';
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

  constructor(
    private sanitizer: DomSanitizer,
    private ontologyService: OntologyService,
    private esService: EsService,
    public propertyService: PropertyService,
    private router: Router,
    private message: XMessageService
  ) {

  }

  ngOnInit(): void {
    this.action(this.type);


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
        this.esService.getEntity(this.id).subscribe((x) => {
          console.log(x);
          this.item = x._source;
         
          this.ontologyService.get(x._source.type).subscribe((type: any) => {
            console.log(type);
            this.form.formGroup.patchValue({ _key: x?._id, label: this.item?.labels?.zh?.value, type: { id: type?.id, label: type?.name }, description: this.item.descriptions?.zh?.value });
           
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
        console.log(item)
        if (this.type === 'add') {
          // this.nodeService.post(item).subscribe((x) => {
          //   this.message.success('新增成功！');
          //   this.router.navigate(['/index/entity']);
          // });
        } else if (this.type === 'edit') {
         
        }
        break;
      case 'cancel':
        break;
    }
  }

 
}


interface Datavalue {
  value: any;
  type: string;
}