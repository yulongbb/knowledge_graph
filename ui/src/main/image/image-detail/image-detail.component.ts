import { ChangeDetectionStrategy, Component, OnInit, Query, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { ImageService } from '../image.service';
import { XTableColumn } from '@ng-nest/ui';
import { map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NodeService } from 'src/main/node/node.service';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDetailComponent implements OnInit {
  id: string = '';
  knowledge: string = '';
  type: string = '';
  schema: string = '';
  item: any;
  statements: any;
  data!: Observable<Array<any>>;
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
    

      this.data = this.nodeService.getLinks(1, 20, this.id, { schema: '9308-543f-3e77e2c85862' }).pipe(
        tap((x: any) => console.log(x)),
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
        this.nodeService.getItem(this.id).subscribe((x) => {
          this.item = x;
          // console.log(x)
          // let item: any = {};
          // item['id'] = x.id;
          // item['label'] = x?.labels?.zh?.value;
          // item['description'] = x?.descriptions?.zh?.value;
          // this.form.formGroup.patchValue(item);
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
    this.router.navigate([`/index/image/${this.knowledge}`], { replaceUrl: true });

  }
}