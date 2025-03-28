import { Component, OnInit } from '@angular/core';
import { DictionaryService } from './dictionary.service';

interface TreeNode {
  id: string;
  title: string;
  type: 'schema' | 'subtype' | 'property' | 'folder';
  children?: TreeNode[];
  expanded?: boolean;
  propertyId?: string;
  isFolder?: boolean;
}

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.less']
})
export class DictionaryComponent implements OnInit {
  treeNodes: TreeNode[] = [];
  dictionaryList: any[] = [];
  selectedNode: TreeNode | null = null;
  showModal = false;
  editData: any = null;
  currentPropertyId: string | undefined;
  loading = false;

  constructor(private dictionaryService: DictionaryService) {}

  ngOnInit() {
    this.loadTreeData();
  }

  loadTreeData() {
    this.loading = true;
    this.dictionaryService.getSchemas().subscribe(
      schemas => {
        console.log('schemas:', schemas);
        this.treeNodes = this.buildTree(schemas.list);
        this.loading = false;
      },
      error => {
        console.error('Failed to load schemas:', error);
        this.loading = false;
      }
    );
  }

  buildTree(flatNodes: any[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // 第一步：创建所有节点的Map
    flatNodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        title: node.name || node.label,
        type: node.type || 'schema',
        children: [],
        expanded: false,
        isFolder: true,  // schema节点都是文件夹
        propertyId: undefined
      });
    });

    // 第二步：构建树结构
    flatNodes.forEach(node => {
      const treeNode = nodeMap.get(node.id);
      if (node.pid) {
        const parentNode = nodeMap.get(node.pid);
        if (parentNode) {
          parentNode.children?.push(treeNode!);
        }
      } else {
        rootNodes.push(treeNode!);
      }
    });

    return this.sortTreeNodes(rootNodes);
  }

  sortTreeNodes(nodes: any): TreeNode[] {
    return nodes.sort((a:any, b:any) => (a.title || '').localeCompare(b.title || ''));
  }

  toggleNode(node: TreeNode) {
    if (node.isFolder) {
      node.expanded = !node.expanded;
      if (node.expanded && (!node.children || node.children.length === 0)) {
        this.loading = true;
        // 加载属性
        this.dictionaryService.getProperties(node.id).subscribe(
          response => {
            node.children = response.list.map((prop: any) => ({
              id: prop.id,
              title: prop.name,
              type: 'property',
              propertyId: prop.id,
              isFolder: false,
              children: []
            }));
            // 对属性节点进行排序
            node.children = this.sortTreeNodes(node.children);
            this.loading = false;
          },
          error => {
            console.error('Failed to load properties:', error);
            this.loading = false;
          }
        );
      }
    }
  }

  selectNode(node: TreeNode) {
    if (node.type === 'property') {
      this.selectedNode = node;
      this.currentPropertyId = node.propertyId;
      this.loadDictionaryList();
    }
  }

  loadDictionaryList() {
    if (this.currentPropertyId) {
      this.dictionaryService.getDictionaryList(this.currentPropertyId).subscribe(data => {
        this.dictionaryList = data;
      });
    }
  }

  openModal(data?: any) {
    this.editData = data ? { ...data } : { propertyId: this.currentPropertyId };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editData = null;
  }

  saveDictionary(formValue: any) {
    if (!formValue) return;
    
    const data = {
      ...formValue,
      propertyId: this.currentPropertyId
    };
    
    this.dictionaryService.saveDictionary(data).subscribe(() => {
      this.loadDictionaryList();
      this.closeModal();
    });
  }

  deleteDictionary(id: string) {
    if (confirm('确认删除此条记录？')) {
      this.dictionaryService.deleteDictionary(id).subscribe(() => {
        this.loadDictionaryList();
      });
    }
  }
}
