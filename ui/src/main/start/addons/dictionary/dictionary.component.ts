import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DictionaryService } from './dictionary.service';
import { DOCUMENT } from '@angular/common';
import { XGuid } from '@ng-nest/ui';

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
export class DictionaryComponent implements OnInit, OnDestroy {
  treeNodes: TreeNode[] = [];
  dictionaryList: any[] = [];
  selectedNode: TreeNode | null = null;
  showModal = false;
  editData: any = null;
  currentPropertyId: string | undefined;
  loading = false;
  showForm = false;
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  menuItems: Array<{ id: string; label: string; icon: string }> = [];
  showAddForm = false;
  addFormType: 'subtype' | 'property' | null = null;
  addFormData: any = {};
  editFormType: 'schema' | 'property' | null = null;
  showEditForm = false;
  editFormData: any = {};

  constructor(
    private dictionaryService: DictionaryService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.loadTreeData();
    this.document.addEventListener('click', this.hideContextMenu.bind(this));
  }

  ngOnDestroy() {
    this.document.removeEventListener('click', this.hideContextMenu.bind(this));
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

    // 第一次遍历：创建所有节点
    flatNodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        title: node.name || node.label,
        type: 'schema',  // 所有节点都是schema类型，包括根节点和子节点
        children: [],
        expanded: false,
        isFolder: true,
        propertyId: undefined
      });
    });

    // 第二次遍历：构建树结构
    flatNodes.forEach(node => {
      const treeNode = nodeMap.get(node.id);
      if (node.pid) {
        // 如果有父节点，添加到父节点的children中
        const parentNode = nodeMap.get(node.pid);
        if (parentNode) {
          // 合并现有的children（如果有的话）
          parentNode.children = [...(parentNode.children || []), treeNode!];
          // 保证children是有序的
          parentNode.children = this.sortTreeNodes(parentNode.children);
        }
      } else {
        // 如果没有父节点，作为根节点
        rootNodes.push(treeNode!);
      }
    });

    // 对根节点排序
    return this.sortTreeNodes(rootNodes);
  }

  sortTreeNodes(nodes: any): TreeNode[] {
    return nodes.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
  }

  toggleNode(node: TreeNode) {
    this.selectedNode = node;
    this.dictionaryList = [];
    this.currentPropertyId = undefined;

    if (node.isFolder) {
      node.expanded = !node.expanded;
      this.loadNodeProperties(node);
    }
  }

  loadNodeProperties(node: TreeNode) {
    if (node.isFolder) {
      this.loading = true;
      this.dictionaryService.getProperties(node.id).subscribe(
        response => {
          // 将属性添加到节点的children中，不覆盖已有的子节点
          const propertyNodes = response.list.map((prop: any) => ({
            id: prop.id,
            title: prop.name,
            type: 'property',
            propertyId: prop.id,
            isFolder: false,
            children: []
          }));

          // 保留现有的schema类型子节点
          const existingChildren = node.children?.filter(child => child.type === 'schema') || [];
          
          // 合并schema节点和property节点
          node.children = [...existingChildren, ...propertyNodes];
          
          // 重新排序
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

  selectNode(node: TreeNode) {
    this.selectedNode = node;

    if (node.type === 'property') {
      this.currentPropertyId = node.propertyId;
      this.loadDictionaryList();
    } else if (node.type === 'schema') {
      this.currentPropertyId = undefined;
      this.dictionaryList = [];
      this.loadNodeProperties(node);
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

  openForm() {
    this.editData = { propertyId: this.currentPropertyId };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editData = null;
  }

  selectDictionary(item: any) {
    this.editData = { ...item };
    this.showForm = true;
  }

  saveDictionary(formValue: any) {
    if (!formValue) return;

    const data = {
      ...formValue,
      propertyId: this.currentPropertyId
    };

    this.dictionaryService.saveDictionary(data).subscribe(() => {
      this.loadDictionaryList();
      this.closeForm();
    });
  }

  deleteDictionary(id: string) {
    if (confirm('确认删除此条记录？')) {
      this.dictionaryService.deleteDictionary(id).subscribe(() => {
        this.loadDictionaryList();
      });
    }
  }

  onContextMenu(event: MouseEvent, node: TreeNode) {
    event.preventDefault();
    event.stopPropagation();
    
    this.selectedNode = node;
    this.contextMenuPosition = {
      x: event.pageX,
      y: event.pageY
    };

    this.menuItems = this.getContextMenuItems(node);
    this.contextMenuVisible = true;
  }

  hideContextMenu() {
    this.contextMenuVisible = false;
  }

  getContextMenuItems(node: TreeNode) {
    if (node.type === 'schema') {
      return [
        { id: 'add-subtype', label: '新增子类型', icon: '+' },
        { id: 'add-property', label: '新增属性', icon: '+' },
        { id: 'edit', label: '编辑', icon: '✎' },
        { id: 'delete', label: '删除', icon: '×' }
      ];
    } else if (node.type === 'property') {
      return [
        { id: 'edit', label: '编辑', icon: '✎' },
        { id: 'delete', label: '删除', icon: '×' }
      ];
    }
    return [];
  }

  onMenuItemClick(item: any) {
    this.hideContextMenu();
    
    if (!this.selectedNode) return;

    switch (item.id) {
      case 'add-subtype':
        if (this.selectedNode.type !== 'schema') return;
        this.showAddForm = true;
        this.addFormType = 'subtype';
        this.addFormData = {
          id: XGuid(),
          pid: this.selectedNode.id,
          name: '',
          label: '',
          description: '',
          collection: '',
          icon: '',
          color: '#1890ff',
          sort: 0,
          value: 1
        };
        break;
      case 'add-property':
        if (this.selectedNode.type !== 'schema') return;
        this.showAddForm = true;
        this.addFormType = 'property';
        this.addFormData = {
          name: '',
          enName: '',
          description: '',
          enDescription: '',
          type: '',
          group: '',
          isPrimary: false,
          schemas: [this.selectedNode.id]
        };
        break;
      case 'edit':
        this.showForm = false;
        this.showAddForm = false;
        this.showEditForm = true;
        this.editFormType = this.selectedNode.type === 'schema' ? 'schema' : 'property';
        if (this.editFormType === 'schema') {
          this.dictionaryService.getSchema(this.selectedNode.id).subscribe(data => {
            this.editFormData = {
              id: data.id,
              name: data.name,
              label: data.label,
              description: data.description,
              collection: data.collection,
              icon: data.icon,
              color: data.color,
              sort: data.sort
            };
          });
        } else {
          this.dictionaryService.getProperty(this.selectedNode.id).subscribe(data => {
            this.editFormData = {
              id: data.id,
              name: data.name,
              enName: data.enName,
              description: data.description,
              enDescription: data.enDescription,
              type: data.type,
              group: data.group,
              isPrimary: data.isPrimary
            };
          });
        }
        break;
      case 'delete':
        if (confirm('确认删除此节点？')) {
          const service = this.selectedNode.type === 'schema' ? 
            this.dictionaryService.deleteSubtype(this.selectedNode.id) :
            this.dictionaryService.deleteProperty(this.selectedNode.id);

          service.subscribe(() => {
            this.loadTreeData();
          });
        }
        break;
    }
  }

  saveAddForm() {
    if (!this.addFormData.name) return;

    if (this.addFormType === 'subtype') {
      this.dictionaryService.createSubtype(this.addFormData).subscribe(() => {
        this.loadTreeData();
        this.closeAddForm();
      });
    } else {
      const propertyData = {
        name: this.addFormData.name,
        enName: this.addFormData.enName,
        description: this.addFormData.description,
        enDescription: this.addFormData.enDescription,
        type: this.addFormData.type,
        group: this.addFormData.group,
        isPrimary: this.addFormData.isPrimary,
        schemas: [{ id: this.selectedNode!.id }]
      };

      this.dictionaryService.createProperty(propertyData).subscribe(() => {
        if (this.selectedNode?.expanded) {
          this.toggleNode(this.selectedNode);
        }
        this.closeAddForm();
      });
    }
  }

  closeAddForm() {
    this.showAddForm = false;
    this.addFormType = null;
    this.addFormData = {};
  }

  saveEditForm() {
    if (!this.editFormData.name) return;

    const service = this.editFormType === 'schema' ? 
      this.dictionaryService.updateSubtype(this.editFormData) :
      this.dictionaryService.updateProperty(this.editFormData);

    service.subscribe(() => {
      this.loadTreeData();
      this.closeEditForm();
    });
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editFormType = null;
    this.editFormData = {};
  }

  addRootType() {
    this.showAddForm = true;
    this.addFormType = 'subtype';
    this.addFormData = {
      id: XGuid(),
      pid: null,
      name: '',
      label: '',
      description: '',
      collection: '',
      icon: '',
      color: '#1890ff',
      sort: 0,
      value: 1
    };
  }
}
