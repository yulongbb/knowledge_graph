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

    flatNodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        title: node.name || node.label,
        type: node.type || 'schema',
        children: [],
        expanded: false,
        isFolder: true,
        propertyId: undefined
      });
    });

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
    return nodes.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
  }

  toggleNode(node: TreeNode) {
    if (node.isFolder) {
      node.expanded = !node.expanded;
      if (node.expanded && (!node.children || node.children.length === 0)) {
        this.loading = true;
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
    
    this.selectedNode = node; // 保存当前选中的节点
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
          id: XGuid(), // 这里需要导入 XGuid
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
        // 关闭其他表单
        this.showForm = false;
        this.showAddForm = false;
        // 显示编辑表单
        this.showEditForm = true;
        this.editFormType = this.selectedNode.type === 'schema' ? 'schema' : 'property';
        if (this.editFormType === 'schema') {
          // 获取完整的schema数据
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
          // 获取完整的property数据
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

    const service = this.addFormType === 'subtype' ? 
      this.dictionaryService.createSubtype(this.addFormData) :
      this.dictionaryService.createProperty(this.addFormData);

    service.subscribe(() => {
      if (this.addFormType === 'subtype') {
        this.loadTreeData();
      } else if (this.selectedNode?.expanded) {
        this.toggleNode(this.selectedNode);
      }
      this.closeAddForm();
    });
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
      pid: null, // 根节点没有父节点
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
