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
import { OntologyService } from '../../ontology/ontology.service';
import { ApplicationService } from '../application.sevice';

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
  controls: XControl[] = [

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
      control: 'find',
      id: 'schemas',
      label: '本体',
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
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup()?.invalid;
  }
  disabled = false;
  query: any;

  constructor(
    private ontologyService: OntologyService,
    private applicationService: ApplicationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看应用';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增应用';
      } else if (this.type === 'update') {
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
        console.log(this.id);
        this.applicationService.get(this.id as string).subscribe((x: any) => {
          this.query.filter = [
            {
              field: 'id',
              value: x.id as string,
              relation: 'applications',
              operation: '=',
            },
          ];
          this.ontologyService
            .getList(1, 10, this.query)
            .subscribe((y: any) => {
              console.log(x);
              console.log(y.list);
              x['schemas'] = y.list;
              this.form.formGroup().patchValue(x);
            });
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          console.log('新增单个');
          this.applicationService
            .post(this.form.formGroup().value)
            .subscribe((x) => {
              this.message.success('新增成功！');
              this.router.navigate(['/index/applications']);
            });
        } else if (this.type === 'edit') {
          this.form.formGroup().value['id'] = Number.parseInt(this.id);
          console.log(this.form.formGroup().value);

          this.applicationService.put(this.form.formGroup().value).subscribe((x) => {
            console.log(this.predicate);
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
