import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid, XQuery } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { map } from 'rxjs';
import { OntologyService } from '../../ontology/ontology.service';
import { PropertyService } from '../property.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetailComponent implements OnInit {
  id: string = '';
  type: string = '';
  predicate: any;
  @ViewChild('form') form!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'find',
      id: 'schemas',
      label: '头部实体',
      required: true,
      multiple: true,
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
      id: 'name',
      label: '名称',
      required: true,
      maxlength: 16,
      // pattern: /^[A-Za-z0-9]{4,16}$/,
      // message: '只能包括数字、字母的组合，长度为4-16位'
    },
    {
      control: 'input',
      id: 'description',
      label: '描述',
      required: false,
      // pattern: /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/,
      // message: '邮箱格式不正确，admin@ngnest.com'
    },
    {
      control: 'select',
      id: 'type',
      label: '值类型',
      required: true,
      data: [
        'time',
        'external-id',
        'monolingualtext',
        'url',
        'wikibase-item',
        'quantity',
        'commonsMedia',
        'string',
        'wikibase-property',
      ]
    },
    {
      control: 'find',
      id: 'types',
      label: '尾部实体',
      required: false,
      multiple: true,
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
      control: 'switch',
      id: 'isPrimary',
      label: '是否为主属性',
    },
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;
  query: XQuery = { filter: [] };

  constructor(
    private ontologyService: OntologyService,
    private propertyService: PropertyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看属性';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增属性';
      } else if (this.type === 'update') {
        this.title = '修改属性';
      }
    });
  }

  ngOnInit(): void {
    this.action(this.type);
  }

  action(type: string) {
    switch (type) {
      case 'info':
        console.log(this.id);
        this.propertyService.get(this.id as string).subscribe((x: any) => {
          this.query.filter = [
            {
              field: 'id',
              value: x.id as string,
              relation: 'properties',
              operation: '=',
            },
          ];
          this.ontologyService
            .getList(1, 10, this.query)
            .subscribe((y: any) => {
              x['schemas'] = y.list;
              this.query.filter = [
                {
                  field: 'id',
                  value: x.id as string,
                  relation: 'values',
                  operation: '=',
                },
              ];
              this.ontologyService
                .getList(1, 10, this.query)
                .subscribe((t: any) => {
                  x['types'] = t.list;
                  this.form.formGroup.patchValue(x);
                });
            });
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          console.log(this.form.formGroup.value);
          this.propertyService
            .post(this.form.formGroup.value)
            .subscribe((x) => {
              this.message.success('新增成功！');
              this.router.navigate(['/index/properties']);
            });
        } else if (this.type === 'edit') {
          this.form.formGroup.value['id']=Number.parseInt(this.id);
          console.log(this.form.formGroup.value);

          this.propertyService.put(this.form.formGroup.value).subscribe((x) => {
            console.log(this.predicate);
            this.message.success('修改成功！');
            this.router.navigate(['/index/properties']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/properties']);
        break;
    }
  }
}
