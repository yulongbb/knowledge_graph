import { Component, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { PageBase } from 'src/share/base/base-page';
import { XTreeAction, XTreeComponent, XGuid } from '@ng-nest/ui';
import { XFormRow } from '@ng-nest/ui/form';
import { UntypedFormGroup } from '@angular/forms';
import {
  Schema,
  OntologyService,
} from 'src/main/ontology/ontology/ontology.service';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { ActivatedRoute, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { forkJoin, map, tap } from 'rxjs';

@Component({
  selector: 'app-ontology',
  templateUrl: 'ontology.component.html',
  styleUrls: ['./ontology.component.scss'],
})
export class OntologyComponent extends PageBase {
  @ViewChild('treeCom') treeCom!: XTreeComponent;
  @ViewChild('form') form!: XFormComponent;

  formGroup = new UntypedFormGroup({});

  get disabled() {
    return !['edit', 'add', 'add-root'].includes(this.type);
  }

  type = 'info';

  selected!: Schema;
  treeLoading = true;

  data = () =>
    this.service
      .getList(1, Number.MAX_SAFE_INTEGER, {
        sort: [
          { field: 'pid', value: 'asc' },
          { field: 'sort', value: 'asc' },
        ],
      })
      .pipe(
        tap((x) => (console.log(x))),
        map((x) => x.list)
      );

  treeActions: XTreeAction[] = [
    {
      id: 'add',
      label: '新增',
      icon: 'fto-plus-square',
      handler: (schema: Schema) => {
        this.action('add', schema);
      },
    },
    {
      id: 'edit',
      label: '修改',
      icon: 'fto-edit',
      handler: (schema: Schema) => {
        this.action('edit', schema);
      },
    },
    {
      id: 'properties',
      label: '属性',
      icon: 'fto-list',
      handler: (schema: Schema) => {
        this.action('properties', schema);
      },
    },
    {
      id: 'delete',
      label: '删除',
      icon: 'fto-trash-2',
      handler: (schema: Schema) => {
        this.action('delete', schema);
      },
    },
  ];

  controls: XFormRow[] = [
    {
      controls: [
        {
          control: 'input',
          id: 'id',
          label: 'id',
        },
        {
          control: 'input',
          id: 'name',
          label: '名称',
        },
        {
          control: 'textarea',
          id: 'ontologies',
          label: '类型集合',
        },
        {
          control: 'input',
          id: 'label',
          label: '标签',
        },
        {
          control: 'color-picker',
          id: 'color',
          label: '颜色'
        },
        {
          control: 'input',
          id: 'icon',
          label: '图标',
        },
        { control: 'input', id: 'description', label: '描述' },
        { control: 'input', id: 'collection', label: '表' },
      ],
    },
    {
      hidden: true,
      controls: [
        {
          control: 'input',
          id: 'pid',
        },
      ],
    },
  ];

  constructor(
    private service: OntologyService,
    public override indexService: IndexService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  action(type: string, schema: Schema) {
    switch (type) {
      case 'add-root':
        this.selected = schema;
        this.type = type;
        this.formGroup.reset();
        this.formGroup.patchValue({
          id: XGuid(),
          pid: null,
        });
        break;
      case 'add':
        this.selected = schema;
        this.type = type;
        this.formGroup.reset();
        this.formGroup.patchValue({
          id: XGuid(),
          pid: schema.id,
        });
        break;
      case 'save':
        if (this.type === 'add' || this.type === 'add-root') {
          console.log(this.formGroup.value);
          if(this.form.formGroup.value.ontologies){
            this.form.formGroup.value.ontologies = this.form.formGroup.value.ontologies.split('\n').filter((t: any) => t != '');
            let arr: any = []
            this.form.formGroup.value.ontologies.forEach((t: any) => {
              arr.push(this.service.post({ id: XGuid(), name: t, label: t, pid: this.selected.id }))
            });
            forkJoin(arr).subscribe(() => {
              this.message.success('新增成功！');
            })
          }else{
              this.treeCom.addNode(x);
              this.message.success('新增成功！');
            });
          }
        
        } else if (this.type === 'edit') {
          console.log(this.formGroup.value);
          this.service.put(this.formGroup.value).subscribe(() => {
            this.type = 'info';
            this.treeCom.updateNode(schema, this.formGroup.value);
            this.message.success('修改成功！');
          });
        }
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${schema.label}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
              this.service.delete(schema.id).subscribe(() => {
                console.log(schema);
                this.treeCom.removeNode(schema);
                this.formGroup.reset();
                this.message.success('删除成功！');
              });
          },
        });
        break;
      case 'edit':
        this.selected = schema;
        this.type = type;
        this.service.get(schema?.id).subscribe((x) => {
          this.formGroup.patchValue(x);
        });
        break;
      case 'properties':
        this.router.navigate([`./properties/${schema.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
    }
  }
}
