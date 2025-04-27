import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XControl } from '@ng-nest/ui/form';
import { XFormComponent } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { NamespaceService } from '../namespace.service';

@Component({
  selector: 'app-namespace-detail',
  templateUrl: './namespace-detail.component.html',
  styleUrls: ['./namespace-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NamespaceDetailComponent implements OnInit {
  id: string = '';
  type: string = '';
  @ViewChild('form') form!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'input',
      id: 'name',
      label: '名称',
      required: true,
      maxlength: 255
    },
    {
      control: 'input',
      id: 'prefix',
      label: '前缀',
      required: true,
      maxlength: 50
    },
    {
      control: 'input',
      id: 'uri',
      label: 'URI',
      maxlength: 255
    },
    {
      control: 'textarea',
      id: 'description',
      label: '描述'
    }
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup()?.invalid;
  }
  disabled = false;

  constructor(
    private namespaceService: NamespaceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看命名空间';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增命名空间';
      } else if (this.type === 'edit') {
        this.title = '修改命名空间';
      }
    });
  }

  ngOnInit(): void {
    this.action(this.type);
  }

  action(type: string) {
    switch (type) {
      case 'info':
      case 'edit':
        this.namespaceService.get(this.id as string).subscribe((x: any) => {
          this.form.formGroup().patchValue(x);
          if (x.name === 'default' && this.type === 'edit') {
            this.message.warning('默认命名空间的名称和前缀不能修改！');
         
          }
        });
        break;
      case 'save':
        if (this.type === 'add') {
          this.namespaceService
            .post(this.form.formGroup().value)
            .subscribe(() => {
              this.message.success('新增成功！');
              this.router.navigate(['/index/namespaces']);
            });
        } else if (this.type === 'edit') {
          const formData = this.form.formGroup().value;
          formData.id = this.id;
          this.namespaceService.put(formData).subscribe(() => {
            this.message.success('修改成功！');
            this.router.navigate(['/index/namespaces']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/namespaces']);
        break;
    }
  }
}
