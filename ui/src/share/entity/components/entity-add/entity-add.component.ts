import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { XMessageService } from '@ng-nest/ui/message';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { map } from 'rxjs/operators';

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
    description: ''
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
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['link', 'image'],
      ['clean']
    ]
  };

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
    private location: Location
  ) {
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

  ngOnInit(): void {}

  isFormValid(): boolean {
    return !!this.formData.type && !!this.formData.label;
  }

  save() {
    if (!this.isFormValid()) return;

    const item:any = {
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
      type: this.formData.type,
      tags: this.formData.tags?.split('#').filter(x => x.trim() !== ''),
      template: this.template
    };

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
}
