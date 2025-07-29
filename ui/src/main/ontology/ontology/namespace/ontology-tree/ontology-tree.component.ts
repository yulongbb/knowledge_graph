import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { XTreeAction, XControl, XMessageService } from '@ng-nest/ui';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { Namespace } from '../namespace.service';
import { XGuid } from '@ng-nest/ui/core';
import { forkJoin } from 'rxjs';
import { OntologyService } from '../../ontology.service';

@Component({
  selector: 'app-ontology-tree',
  templateUrl: './ontology-tree.component.html',
  styleUrls: ['./ontology-tree.component.scss'],
})
export class OntologyTreeComponent implements OnChanges {
  @Input() selectedNamespace: Namespace | null = null;
  @Input() namespaceOptions: { label: string; value: string }[] = [];

  @Output() ontologySelected = new EventEmitter<any>();
  @Output() ontologyDataLoaded = new EventEmitter<boolean>();

  // Ontology management - use different name to avoid conflict with output
  isOntologyDataLoaded = false;
  ontologyData: any[] = [];
  selectedOntology: any = null;

  // Form management
  ontologyFormMode: 'add' | 'edit' | 'view' | null = null;
  ontologyForm = new UntypedFormGroup({});
  ontologyControls: XControl[] = [
    { control: 'input', id: 'name', label: '名称', required: true },
    { control: 'textarea', id: 'description', label: '描述' },
    { control: 'input', id: 'label', label: '标签' },
    {
      control: 'select',
      id: 'namespace',
      label: '命名空间',
      data: [] as any[],
    },
  ];

  treeActions: XTreeAction[] = [
    {
      id: 'add',
      label: '新增',
      icon: 'fto-plus-square',
      handler: (node: any) => {
        this.action('add', node);
      },
    },
    {
      id: 'edit',
      label: '修改',
      icon: 'fto-edit',
      handler: (node: any) => {
        this.action('edit', node);
      },
    },
    {
      id: 'delete',
      label: '删除',
      icon: 'fto-trash-2',
      handler: (node: any) => {
        this.action('delete', node);
      },
    },
  ];

  constructor(
    private ontologyService: OntologyService,
    private message: XMessageService,
    private msgBox: XMessageBoxService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedNamespace'] && this.selectedNamespace) {
      this.loadOntologyData();
    }

    if (changes['namespaceOptions'] && this.namespaceOptions) {
      this.updateNamespaceControl();
    }
  }

  private updateNamespaceControl() {
    const namespaceControl = this.ontologyControls.find(
      (c) => c.id === 'namespace'
    );
    if (namespaceControl) {
      namespaceControl['data'] = this.namespaceOptions;
    }
  }

  loadOntologyData() {
    if (!this.selectedNamespace) {
      this.isOntologyDataLoaded = false;
      this.ontologyDataLoaded.emit(false);
      return;
    }

    this.isOntologyDataLoaded = false;
    this.ontologyDataLoaded.emit(false);

    const filter = [
      {
        field: 'namespaceId',
        value: this.selectedNamespace.id?.toString() || '',
      },
    ];

    this.ontologyService
      .getList(1, Number.MAX_SAFE_INTEGER, {
        filter: filter,
        sort: [
          { field: 'pid', value: 'asc' },
          { field: 'sort', value: 'asc' },
        ],
      })
      .subscribe({
        next: (response: any) => {
          console.log('Ontology data loaded:', response);
          this.ontologyData = this.enhanceOntologyData(response.list);
          this.isOntologyDataLoaded = true;
          this.ontologyDataLoaded.emit(true);
          this.selectedOntology = null;
        },
        error: (error:any) => {
          console.error('Failed to load ontology data:', error);
          this.message.error('加载本体数据失败');
          this.ontologyDataLoaded.emit(false);
        },
      });
  }

  private enhanceOntologyData(data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];

    const nodeMap = new Map();
    data.forEach((node) => nodeMap.set(node.id, { ...node, children: [] }));

    const roots: any[] = [];
    nodeMap.forEach((node) => {
      if (!node.pid) {
        node.icon = 'fto-layers';
        node.className = 'ontology-main';
        roots.push(node);
      } else {
        const parent = nodeMap.get(node.pid);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
          node.className = 'ontology-child';
        }
      }
    });

    const processNode = (node: any) => {
      if (!node.children || node.children.length === 0) {
        node.icon = node.icon || 'fto-circle';
        node.className = 'ontology-leaf';
      } else {
        node.children.forEach(processNode);
      }
      return node;
    };

    return roots.map(processNode);
  }

  selectOntology(ontology: any) {
    console.log('Selected ontology:', ontology);
    this.selectedOntology = ontology;
    this.ontologyFormMode = null;
    this.ontologySelected.emit(ontology);
  }

  action(type: string, schema?: any) {
    switch (type) {
      case 'add-root':
        this.ontologyFormMode = 'add';
        this.ontologyForm.reset();
        this.ontologyForm.patchValue({
          id: XGuid(),
          pid: null,
          namespace: this.selectedNamespace?.id,
          namespaceId: this.selectedNamespace?.id,
        });
        break;
      case 'add':
        this.ontologyFormMode = 'add';
        this.ontologyForm.reset();
        this.ontologyForm.patchValue({
          id: XGuid(),
          pid: schema?.id,
          namespace: this.selectedNamespace?.id,
          namespaceId: this.selectedNamespace?.id,
        });
        break;
      case 'save':
        if (this.ontologyFormMode === 'add') {
          // 批量新增
          if (this.ontologyForm.value.ontologies) {
            this.ontologyForm.value.ontologies =
              this.ontologyForm.value.ontologies
                ?.split('\n')
                .filter((t: any) => t != '');
            let arr: any = [];
            this.ontologyForm.value.ontologies.forEach((t: any) => {
              arr.push(
                this.ontologyService.post({
                  id: XGuid(),
                  name: t,
                  label: t,
                  pid: this.ontologyForm.value.pid ?? this.selectedOntology?.id ?? null,
                  namespaceId: this.ontologyForm.value.namespace ?? this.selectedNamespace?.id ?? null,
                })
              );
            });
            forkJoin(arr).subscribe(() => {
              this.message.success('新增成功！');
              this.cancelOntologyForm();
              this.loadOntologyData();
            });
          } else {
            // 新增单个
            const data = { ...this.ontologyForm.value };
            if (!data.id) data.id = XGuid();
            // 确保 pid 和 namespaceId 正确
            data.pid = data.pid ?? this.selectedOntology?.id ?? null;
            data.namespaceId = data.namespace ?? this.selectedNamespace?.id ?? null;
            this.ontologyService.post(data).subscribe((x) => {
              this.ontologyFormMode = null;
              this.message.success('新增成功！');
              this.loadOntologyData();
            });
          }
        } else if (this.ontologyFormMode === 'edit') {
          this.ontologyService.put(this.ontologyForm.value).subscribe(() => {
            this.ontologyFormMode = null;
            this.message.success('修改成功！');
            this.loadOntologyData();
          });
        }
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${schema.label || schema.name}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
              this.ontologyService.delete(schema.id).subscribe(() => {
                this.ontologyForm.reset();
                this.message.success('删除成功！');
                this.loadOntologyData();
              });
          },
        });
        break;
      case 'edit':
        this.selectedOntology = schema;
        this.ontologyFormMode = 'edit';
        this.ontologyService.get(schema?.id).subscribe((x) => {
          this.ontologyForm.patchValue(x);
        });
        break;
    }
  }

  saveOntology() {
    if (this.ontologyForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    const formData = this.ontologyForm.value;

    if (!formData.id && this.ontologyFormMode === 'add') {
      formData.id = this.generateUniqueId();
    }

    const ontologyData = {
      ...formData,
      pid: this.selectedOntology?.id || null,
      namespaceId: formData.namespace || this.selectedNamespace?.id || null,
    };

    if (this.ontologyFormMode === 'add') {
      this.ontologyService.post(ontologyData).subscribe({
        next: () => {
          this.message.success('新增本体成功');
          this.cancelOntologyForm();
          if (ontologyData.pid && this.selectedOntology) {
            this.message.info(
              `已创建为 "${
                this.selectedOntology.name || this.selectedOntology.label
              }" 的子本体`
            );
          }
          this.loadOntologyData();
        },
        error: (error:any) => {
          console.error('Failed to add ontology:', error);
          this.message.error('新增本体失败: ' + error.message);
        },
      });
    } else if (this.ontologyFormMode === 'edit') {
      this.ontologyService.put(ontologyData).subscribe({
        next: () => {
          this.message.success('编辑本体成功');
          this.cancelOntologyForm();
          this.loadOntologyData();
        },
        error: (error:any) => {
          console.error('Failed to edit ontology:', error);
          this.message.error('编辑本体失败: ' + error.message);
        },
      });
    }
  }

  cancelOntologyForm() {
    this.ontologyFormMode = null;
    this.ontologyForm.reset();
  }

  private generateUniqueId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ont-${timestamp}-${randomPart}`;
  }
}
