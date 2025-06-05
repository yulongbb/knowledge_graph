import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { map, switchMap } from 'rxjs/operators';
import { NamespaceService } from 'src/main/ontology/namespace/namespace.service';
import { XOperation } from '@ng-nest/ui'; // Add this import
import { HttpClient } from '@angular/common/http'; // 添加 HttpClient 导入

interface TreeNode {
  id: string;
  name: string;
  pid?: string;
  children?: TreeNode[];
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
    namespace: '' // Changed from 'default' to empty string initially
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
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  // New properties for namespaces
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
    private namespaceService: NamespaceService, // Added namespace service
    private message: XMessageService,
    private location: Location,
    private http: HttpClient // 添加 HttpClient
  ) {
    // Load namespaces for dropdown
    this.loadNamespaces();

    this.types$ = this.ontologyService.getList(1, Number.MAX_SAFE_INTEGER, {
      sort: [
        { field: 'pid', value: 'asc' },
        { field: 'sort', value: 'asc' }
      ]
    }).pipe(
      map(x => x.list || []),
      map(list => this.buildTree(list))
    );

    this.types$.subscribe(tree => {
      this.typeTree = tree;
    });
  }

  ngOnInit(): void {
    // Wait for namespaces to load before loading types
    // The first namespace will be automatically selected in loadNamespaces()
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
    this.namespaceService.findByName(this.formData.namespace).subscribe({
      next: (namespaceData: any) => {
        console.log('Found namespace:', namespaceData);
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
          namespace: namespaceData.id,
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
      },
      error: (error) => {
        this.message.error('获取命名空间失败：' + error.message);
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

  toggleNode(node: TreeNode, event: Event) {
    event.stopPropagation();
    node.expanded = !node.expanded;
  }

  selectType(node: TreeNode, event: Event) {
    event.stopPropagation();
    this.formData.type = node.id;
    this.selectedTypeName = node.name;
    this.showTypeSelect = false;
  }

  buildTree(list: any[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    const tree: TreeNode[] = [];

    // First pass: Create all nodes
    list.forEach(item => {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        pid: item.pid,
        children: [],
        expanded: false,
        level: 0
      });
    });

    // Second pass: Build tree structure
    map.forEach(node => {
      if (node.pid && map.has(node.pid)) {
        const parent = map.get(node.pid)!;
        parent.children!.push(node);
        node.level = parent.level! + 1;
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  filterNodes(nodes: TreeNode[]): TreeNode[] {
    if (!this.typeSearchText) return nodes;

    return nodes.filter(node => {
      const matches = node.name.toLowerCase().includes(this.typeSearchText.toLowerCase());
      if (node.children?.length) {
        node.children = this.filterNodes(node.children);
        return matches || node.children.length > 0;
      }
      return matches;
    });
  }

  // Load namespaces for the dropdown
  loadNamespaces() {
    this.namespaceService.getList(1, 1000).subscribe({
      next: (response: any) => {
        const namespaces = response.list || [];
        this.namespaceOptions = namespaces.map((ns: any) => ({
          label: ns.name,
          value: ns.name
        }));

        // Set the first namespace as default if available
        if (this.namespaceOptions.length > 0) {
          this.formData.namespace = this.namespaceOptions[0].value;
          // Load types for the default namespace
          this.loadTypesForNamespace(this.formData.namespace);
        } else {
          // Fallback to 'default' if no namespaces are available
          this.namespaceOptions.push({ label: 'default', value: 'default' });
          this.formData.namespace = 'default';
          this.loadTypesForNamespace('default');
        }
      },
      error: (error) => {
        console.error('Failed to load namespaces:', error);
        this.message.error('加载命名空间失败');
        // Ensure at least default namespace is available
        this.namespaceOptions = [{ label: 'default', value: 'default' }];
        this.formData.namespace = 'default';
        this.loadTypesForNamespace('default');
      }
    });
  }

  // When namespace changes, refresh the types tree
  onNamespaceChange(namespace: string) {
    console.log('Selected namespace:', namespace);

    // Clear selected type when namespace changes
    this.formData.type = '';
    this.selectedTypeName = '';

    // Reload types for the selected namespace
    this.loadTypesForNamespace(namespace);
  }

  // Load types specific to the selected namespace
  loadTypesForNamespace(namespace: string) {
    // Check if namespace is empty or undefined
    if (!namespace) {
      console.warn('No namespace selected, cannot load types');
      return;
    }

    // Find the namespace ID from the options
    const namespaceObj = this.namespaceOptions.find(n => n.value === namespace);
    if (!namespaceObj) return;

    // Clear the search text when changing namespaces
    this.typeSearchText = '';

    // Get the namespace ID for filtering ontologies
    this.namespaceService.findByName(namespace).subscribe({
      next: (namespaceData: any) => {
        console.log('Found namespace:', namespaceData);

        let filter: any[];

        // Create filter based on whether we have an ID or not
        if (namespaceData.id) {
          filter = [{
            field: 'namespaceId',
            value: namespaceData.id,
            operation: '=' as XOperation
          }];
        } else {
          filter = [{
            field: 'namespaceId',
            value: '',
            operation: 'isNull' as XOperation
          }];
        }

        // Load ontologies filtered by namespace
        this.ontologyService.getList(1, Number.MAX_SAFE_INTEGER, {
          filter: filter,
          sort: [
            { field: 'pid', value: 'asc' },
            { field: 'sort', value: 'asc' }
          ]
        }).pipe(
          map(x => {
            console.log(`Loaded ${x.list?.length || 0} types for namespace ${namespace} with ID ${namespaceData.id}`);
            return x.list || [];
          }),
          map(list => this.buildTree(list))
        ).subscribe(tree => {
          this.typeTree = tree;

          // Auto-open dropdown to show filtered types when namespace changes
          if (tree && tree.length > 0) {
            setTimeout(() => {
              this.showTypeSelect = true;
            }, 100);
          } else {
            this.message.info(`${namespace} 命名空间下没有可用的类型`);
          }
        });
      },
      error: (error) => {
        console.error(`Failed to find namespace by name: ${namespace}`, error);
        this.message.error('获取命名空间信息失败');

        // Fallback to loading all types
        this.loadAllTypes();
      }
    });
  }

  // Fallback method to load all types if namespace filtering fails
  loadAllTypes() {
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
