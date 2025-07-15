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
import { ApplicationService } from '../application.sevice';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { NamespaceService } from 'src/main/ontology/namespace/namespace.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailComponent implements OnInit {
  id: string = '';
  type: string = '';
  predicate: any;
  @ViewChild('form') form!: XFormComponent;
  namespaces: any[] = []; // 存储命名空间列表
  controls: XControl[] = [
    {
      control: 'input',
      id: 'name',
      label: '名称',
      required: true,
      maxlength: 50,
    },
    {
      control: 'textarea',
      id: 'description',
      label: '描述',
      required: false,
      rows: 4,
    },
    {
      control: 'input',
      id: 'category',
      label: '分类',
      required: true,
    },
    {
      control: 'input',
      id: 'url',
      label: '访问链接',
      required: false,
    },
    {
      control: 'switch',
      id: 'isPinned',
      label: '是否置顶',
      required: false,
    },
    {
      control: 'select',
      id: 'namespaces',
      label: '关联命名空间',
      required: false,
      multiple: true,
      data: () => this.namespaceService.getList(1, 50).pipe(map((x: any) => x.list)), // 显式声明x类型
    },
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;

  constructor(
    private ontologyService: OntologyService,
    private applicationService: ApplicationService,
    private namespaceService: NamespaceService, // 注入命名空间服务
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看应用';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增应用';
      } else if (this.type === 'edit') {
        this.title = '修改应用';
      }
    });
  }

  ngOnInit(): void {
    this.action(this.type);
  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.applicationService.get(this.id).subscribe((app: any) => {
          this.form.formGroup.patchValue(app);
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          this.applicationService.post(this.form.formGroup.value).subscribe(() => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/applications']);
          });
        } else if (this.type === 'edit') {
          this.applicationService.put({ ...this.form.formGroup.value, id: this.id }).subscribe(() => {
            this.message.success('修改成功！');
            this.router.navigate(['/index/applications']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/applications']);
        break;
    }
  }
}
