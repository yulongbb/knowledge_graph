import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { map } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { KnowledgeService } from '../knowledge.service';

@Component({
  selector: 'app-knowledge-detail',
  templateUrl: './knowledge-detail.component.html',
  styleUrls: ['./knowledge-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KnowledgeDetailComponent implements OnInit {
  id: string = '';
  type: string = '';
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
      control: 'input',
      id: 'description',
      label: '描述',
      required: true,
      // pattern: /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/,
      // message: '邮箱格式不正确，admin@ngnest.com'
    },
    {
      control: 'find',
      id: 'schemas',
      label: '类型',
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
    { control: 'input', id: 'id', hidden: true, value: XGuid() }
  ];
  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;
  constructor(
    private ontologyService: OntologyService,
    private knowledgeService: KnowledgeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看知识库';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增知识库';
      } else if (this.type === 'update') {
        this.title = '修改知识库';
      }
    });
  }

  ngOnInit(): void {
    this.action(this.type);
  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.knowledgeService.get(this.id).subscribe((x) => {
          this.form.formGroup.patchValue(x);
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          console.log(this.form.formGroup.value)
          this.knowledgeService.post(this.form.formGroup.value).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/knowledge']);
          });
        } else if (this.type === 'edit') {
          this.knowledgeService.put(this.form.formGroup.value).subscribe((x) => {
            this.message.success('修改成功！');
            this.router.navigate(['/index/knowledge']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/knowledge']);
        break;
    }
  }
}