import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { map, switchMap } from 'rxjs/operators';
import { XOperation, XTreeNode } from '@ng-nest/ui';
import { HttpClient } from '@angular/common/http';

// 修改TreeNode接口以符合ng-nest树组件的要求
interface TreeNode {
  id: string;
  label: string; // ng-nest树组件使用label而不是name
  pid?: string;
  children?: TreeNode[];
  icon?: string;
  expanded?: boolean;
  level?: number;
}

@Component({
  selector: 'app-entity-add',
  templateUrl: './entity-add.component.html',
  styleUrls: ['./entity-add.component.scss']
})
export class EntityAddComponent implements OnInit {
  formData = {
    type: '',
    label: '',
    aliases: '',
    tags: '',
    description: '',
    namespace: ''
  };

  template: string = '';
  types$: Observable<any[]>;

  showTypeSelect = false;
  typeSearchText = '';
  typeTree: TreeNode[] = [];
  selectedTypeName = '';

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    imageResize: {
      displaySize: true
    }
  };

  namespaceOptions: { label: string; value: string }[] = [];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-tree-select')) {
      this.showTypeSelect = false;
    }
  }

  constructor(
    private entityService: EntityService,
    private ontologyService: OntologyService,
    private message: XMessageService,
    private location: Location,
    private http: HttpClient
  ) {
    this.types$ = new Observable();
  }

  ngOnInit(): void {
    this.ontologyService.getList(1, Number.MAX_SAFE_INTEGER, {
      filter: [],
      sort: [
        { field: 'pid', value: 'asc' },
        { field: 'sort', value: 'asc' }
      ]
    }).pipe(
      map(x => {
        console.log('Raw ontology data:', x.list);
        return x.list || [];
      }),
      map(list => this.buildTree(list))
    ).subscribe({
      next: (tree) => {
        this.typeTree = tree;
      },
      error: (error) => {
        console.error('Failed to load ontology tree:', error);
        this.message.error('加载本体树失败');
        this.typeTree = [];
      }
    });
  }

  isFormValid(): boolean {
    return !!this.formData.type && !!this.formData.label;
  }

  save() {
    if (!this.isFormValid()) return;

    // 首先将模版内容存储到文章表中获取返回的文章id
    if (this.template) {
      const article = {
        title: this.formData.label,
        content: this.template,
        author: 'system' // 可以根据实际情况修改作者信息
      };

      // 调用文章API保存模板内容
      this.http.post('/api/article', article).subscribe({
        next: (articleData: any) => {
          console.log('Template saved as article:', articleData);
          this.saveEntity(articleData.id);
        },
        error: (error) => {
          console.error('Failed to save template as article:', error);
          this.message.error('保存模板失败：' + error.message);
          // 即使模板保存失败，仍然保存实体
          this.saveEntity();
        }
      });
    } else {
      // 如果没有模板，直接保存实体
      this.saveEntity();
    }
  }

  // 将保存实体的逻辑提取为单独的方法
  private saveEntity(articleId?: string) {
    const item: any = {
      labels: {
        zh: { language: 'zh', value: this.formData.label }
      },
      aliases: {
        zh: this.formData.aliases?.split(',').map(alias => ({
          language: 'zh',
          value: alias.trim()
        }))
      },
      descriptions: {
        zh: { language: 'zh', value: this.formData.description }
      },
      type: { id: this.formData.type },
      tags: this.formData.tags?.split('#').filter(x => x.trim() !== ''),
      template: articleId,
    };
    console.log('Saving entity with data:', item);

    this.entityService.addItem(item).subscribe({
      next: () => {
        this.message.success('新增成功！');
        this.back();
      },
      error: (error) => {
        this.message.error('新增失败：' + error.message);
      }
    });
  }

  back() {
    this.location.back();
  }

  toggleTypeSelect(event: Event) {
    event.stopPropagation();
    this.showTypeSelect = !this.showTypeSelect;
  }

  // 修改为适配ng-nest树组件的选择方法
  onTreeNodeActivated(node: XTreeNode) {
    if (node && node.id) {
      this.formData.type = node.id;
      this.selectedTypeName = node.label || '';
      this.showTypeSelect = false;
    }
  }

  // 修改buildTree方法以适配ng-nest树组件
  buildTree(list: any[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    const tree: TreeNode[] = [];

    // First pass: Create all nodes
    list.forEach(item => {
      map.set(item.id, {
        id: item.id,
        label: item.name || item.label,
        pid: item.pid,
        children: [],
        icon: 'fto-box', // 为所有节点设置默认图标
        expanded: false,
        level: 0
      });
    });

    // Second pass: Build tree structure
    map.forEach(node => {
      if (node.pid && map.has(node.pid)) {
        const parent = map.get(node.pid)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
        node.level = parent.level! + 1;
      } else {
        tree.push(node);
      }
    });

    // Auto-expand first level
    tree.forEach(rootNode => {
      rootNode.expanded = true;
    });

    return tree;
  }

  // Load namespaces for the dropdown
  // loadNamespaces() {
  //   this.namespaceService.getList(1, 1000).subscribe({
  //     next: (response: any) => {
  //       const namespaces = response.list || [];
  //       this.namespaceOptions = namespaces.map((ns: any) => ({
  //         label: ns.name,
  //         value: ns.name
  //       }));

  //       // Set the first namespace as default if available
  //       if (this.namespaceOptions.length > 0) {
  //         this.formData.namespace = this.namespaceOptions[0].value;
  //         // Load ontology tree for the default namespace
  //         this.loadOntologyTreeForNamespace(this.formData.namespace);
  //       } else {
  //         // Fallback to 'default' if no namespaces are available
  //         this.namespaceOptions.push({ label: 'default', value: 'default' });
  //         this.formData.namespace = 'default';
  //         this.loadOntologyTreeForNamespace('default');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Failed to load namespaces:', error);
  //       this.message.error('加载命名空间失败');
  //       // Ensure at least default namespace is available
  //       this.namespaceOptions = [{ label: 'default', value: 'default' }];
  //       this.formData.namespace = 'default';
  //       this.loadOntologyTreeForNamespace('default');
  //     }
  //   });
  // }

  // // When namespace changes, refresh the ontology tree
  // onNamespaceChange(namespace: string) {
  //   console.log('Selected namespace:', namespace);

  //   // Clear selected type when namespace changes
  //   this.formData.type = '';
  //   this.selectedTypeName = '';

  //   // Reload ontology tree for the selected namespace
  //   this.loadOntologyTreeForNamespace(namespace);
  // }

  // // Load ontology tree specific to the selected namespace
  // loadOntologyTreeForNamespace(namespace: string) {
  //   if (!namespace) {
  //     console.warn('No namespace selected, cannot load ontology tree');
  //     return;
  //   }

  //   this.typeSearchText = '';

  //   this.namespaceService.findByName(namespace).subscribe({
  //     next: (namespaceData: any) => {
  //       console.log('Found namespace for ontology tree:', namespaceData);

  //       let filter: any[];

  //       if (namespace === 'default' || !namespaceData.id) {
  //         filter = [{
  //           field: 'namespaceId',
  //           value: '',
  //           operation: 'isNull' as XOperation
  //         }];
  //       } else {
  //         filter = [{
  //           field: 'namespaceId',
  //           value: namespaceData.id,
  //           operation: '=' as XOperation
  //         }];
  //       }

  //       this.ontologyService.getList(1, Number.MAX_SAFE_INTEGER, {
  //         filter: filter,
  //         sort: [
  //           { field: 'pid', value: 'asc' },
  //           { field: 'sort', value: 'asc' }
  //         ]
  //       }).pipe(
  //         map(x => {
  //           console.log(`Loaded ${x.list?.length || 0} ontologies for namespace ${namespace}`);
  //           console.log('Raw ontology data:', x.list);
  //           return x.list || [];
  //         }),
  //         map(list => this.buildTree(list))
  //       ).subscribe({
  //         next: (tree) => {
  //           this.typeTree = tree;
  //           console.log('Built ontology tree:', tree);

  //           if (tree && tree.length > 0) {
  //             console.log(`成功加载 ${namespace} 命名空间下的本体树，共 ${tree.length} 个根节点`);
  //           } else {
  //             this.message.info(`${namespace} 命名空间下没有可用的本体`);
  //           }
  //         },
  //         error: (error) => {
  //           console.error('Failed to load ontology tree:', error);
  //           this.message.error('加载本体树失败');
  //           this.typeTree = [];
  //         }
  //       });
  //     },
  //     error: (error) => {
  //       console.error(`Failed to find namespace by name: ${namespace}`, error);
  //       this.message.error('获取命名空间信息失败');
  //       this.loadAllOntologies();
  //     }
  //   });
  // }

  // Fallback method to load all ontologies if namespace filtering fails
  loadAllOntologies() {
    this.ontologyService.getList(1, Number.MAX_SAFE_INTEGER, {
      sort: [
        { field: 'pid', value: 'asc' },
        { field: 'sort', value: 'asc' }
      ]
    }).pipe(
      map(x => x.list || []),
      map(list => this.buildTree(list))
    ).subscribe(tree => {
      this.typeTree = tree;
    });
  }
}
