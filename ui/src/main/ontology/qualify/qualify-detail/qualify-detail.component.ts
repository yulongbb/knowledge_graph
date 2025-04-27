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
import { PropertyService } from '../../property/property.service';
import { QualifyService } from '../qualify.service';

@Component({
  selector: 'app-qualify-detail',
  templateUrl: './qualify-detail.component.html',
  styleUrls: ['./qualify-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualifyDetailComponent implements OnInit {
  id: string = '';
  type: string = '';
  predicate: any;
  @ViewChild('form') form!: XFormComponent;
  controls: XControl[] = [
   
    {
      control: 'input',
      id: 'label',
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
        'commonsMedia',
        'external-id',
        'string',
        'url',
        'math',
        'monolingualtext',
        'musical-notation',
        'globe-coordinate',
        'quantity',
        'time',
        'globe-coordinate',
        'tabular-data',
        'geo-shape',
        'wikibase-item',
        'wikibase-qualify',
        'wikibase-lexeme',
        'wikibase-form',
        'wikibase-sense',
      ]
    },

    {
      control: 'switch',
      id: 'isPrimary',
      label: '是否为主限定',
    },
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;
  query: any

  constructor(
    private propertyService: PropertyService,
    private qualifyService: QualifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看限定';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增限定';
      } else if (this.type === 'update') {
        this.title = '修改限定';
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
        this.qualifyService.get(this.id as string).subscribe((x: any) => {
          this.form.formGroup.patchValue(x);
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          this.qualifyService
            .post(this.form.formGroup.value)
            .subscribe((x) => {
              this.message.success('新增成功！');
              this.router.navigate(['/index/qualify']);
            });
        } else if (this.type === 'edit') {
          this.form.formGroup.value['id'] = Number.parseInt(this.id);
          this.qualifyService.put(this.form.formGroup.value).subscribe((x) => {
            console.log(this.predicate);
            this.message.success('修改成功！');
            this.router.navigate(['/index/qualify']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/properties']);
        break;
    }
  }
}
