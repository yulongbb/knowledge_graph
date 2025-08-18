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
      maxlength: 255,
      placeholder: '请输入命名空间名称'
    },
    {
      control: 'input',
      id: 'prefix',
      label: '前缀',
      required: true,
      maxlength: 50,
      placeholder: '请输入命名空间前缀',
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '前缀必须以字母开头，只能包含字母、数字和下划线'
    },
    {
      control: 'input',
      id: 'uri',
      label: 'URI',
      maxlength: 255,
      placeholder: '请输入命名空间URI',
      pattern: /^https?:\/\/.+/,
      message: 'URI格式不正确，请输入有效的HTTP或HTTPS地址'
    },
    {
      control: 'textarea',
      id: 'description',
      label: '描述',
      placeholder: '请输入命名空间描述信息',
      maxlength: 500,
      rows: 3
    }
  ];
  title = '';
  loading = false;
  get formInvalid() {
    return this.form?.formGroup?.invalid;
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
        this.loadData();
        break;
      case 'save':
        this.saveData();
        break;
      case 'cancel':
        this.router.navigate(['/index/namespace']);
        break;
    }
  }

  private loadData() {
    this.loading = true;
    this.namespaceService.get(this.id as string).subscribe({
      next: (x: any) => {
        this.loading = false;
        this.form.formGroup.patchValue(x);
        
        // 如果是编辑默认命名空间，禁用名称和前缀字段
        if (x.name === 'default' && this.type === 'edit') {
          this.message.warning('默认命名空间的名称和前缀不能修改！');
          this.updateControlsForDefault();
        }
      },
      error: (error) => {
        this.loading = false;
        this.message.error('数据加载失败：' + (error.message || '未知错误'));
        this.router.navigate(['/index/namespace']);
      }
    });
  }

  private updateControlsForDefault() {
    this.controls = this.controls.map(control => {
      if (control.id === 'name' || control.id === 'prefix') {
        return { ...control, disabled: true };
      }
      return control;
    });
  }

  private saveData() {
    if (this.formInvalid) {
      this.message.warning('请检查表单填写是否正确！');
      return;
    }

    this.loading = true;
    const formData = { ...this.form.formGroup.value };

    if (this.type === 'add') {
      // 新增前检查前缀是否重复
      this.checkPrefixUnique(formData.prefix).then(isUnique => {
        if (!isUnique) {
          this.loading = false;
          this.message.error('前缀已存在，请使用其他前缀！');
          return;
        }

        this.namespaceService.post(formData).subscribe({
          next: () => {
            this.loading = false;
            this.message.success('新增成功！');
            this.router.navigate(['/index/namespace']);
          },
          error: (error) => {
            this.loading = false;
            this.message.error('新增失败：' + (error.message || '未知错误'));
          }
        });
      });
    } else if (this.type === 'edit') {
      formData.id = this.id;
      this.namespaceService.put(formData).subscribe({
        next: () => {
          this.loading = false;
          this.message.success('修改成功！');
          this.router.navigate(['/index/namespace']);
        },
        error: (error) => {
          this.loading = false;
          this.message.error('修改失败：' + (error.message || '未知错误'));
        }
      });
    }
  }

  private async checkPrefixUnique(prefix: string): Promise<boolean> {
    try {
      const result = await this.namespaceService.findByName(prefix).toPromise();
      return !result; // 如果没有找到，说明前缀唯一
    } catch (error) {
      return true; // 发生错误时假设唯一，让后端处理
    }
  }
}
