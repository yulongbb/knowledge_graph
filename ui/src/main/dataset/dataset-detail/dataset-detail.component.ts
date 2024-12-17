import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XQuery } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { forkJoin, map } from 'rxjs';
import { DatasetService } from '../dataset.sevice';

@Component({
  selector: 'app-dataset-detail',
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetDetailComponent implements OnInit {
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
      maxlength: 160,
      // pattern: /^[A-Za-z0-9]{4,16}$/,
      // message: '只能包括数字、字母的组合，长度为4-16位'
    },
    {
      control: 'textarea',
      id: 'description',
      label: '描述',
    },
    {
      control: 'select',
      id: 'type',
      label: '类型',
      data: ['常识','城市','金融','农业','地理','气象','社交','物联网','医疗','娱乐','生活','商业','出行','科教','其它',]
    },
    // {
    //   control: 'textarea',
    //   id: 'tags',
    //   label: '标签',
    // }
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;
  query: XQuery = { filter: [] };

  constructor(
    private datasetService: DatasetService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看标签';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增标签';
      } else if (this.type === 'update') {
        this.title = '修改标签';
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
        this.datasetService.get(this.id as string).subscribe((x: any) => {
          this.query.filter = [
            {
              field: 'id',
              value: x.id as string,
              relation: 'datasets',
              operation: '=',
            },
          ];
        
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        console.log(this.form.formGroup.value)
        if (this.type === 'add') {
          this.datasetService
          .post(this.form.formGroup.value)
          .subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/dataset']);
          });
        } else if (this.type === 'edit') {
          this.form.formGroup.value['id'] = Number.parseInt(this.id);
          console.log(this.form.formGroup.value);

          this.datasetService.put(this.form.formGroup.value).subscribe((x) => {
            console.log(this.predicate);
            this.message.success('修改成功！');
            this.router.navigate(['/index/dataset']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/dataset']);
        break;
    }
  }

  uploadSuccess($event: any) {
    console.log($event.body.name)
    this.form.formGroup.value['files'] = [$event.body.name]
    console.log(this.form.formGroup.value)

  }
}
