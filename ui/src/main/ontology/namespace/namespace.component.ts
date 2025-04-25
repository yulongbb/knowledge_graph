import { PageBase } from 'src/share/base/base-page';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import {
  XMessageService,
  XQuery,
  XTableColumn,
  XTableComponent,
  XTreeAction,
  XOperation  // Fix the import name from Operation to XOperation
} from '@ng-nest/ui';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Namespace, NamespaceService } from './namespace.service';
import { OntologyService } from '../ontology/ontology.service';
import { PropertyService } from '../property/property.service';
import { QualifyService } from '../qualify/qualify.service';
import { TagService } from '../tag/tag.sevice';

@Component({
  selector: 'app-namespace',
  templateUrl: 'namespace.component.html',
  styleUrls: ['./namespace.component.scss'],
})
export class NamespaceComponent extends PageBase implements OnInit {
  // Namespace management
  formGroup = new UntypedFormGroup({});
  name = '';
  prefix = '';
  description = '';
  selected!: Namespace;
  type = 'add';
  loading = true;

  index = 1;
  size = 15;

  query: XQuery = { filter: [] };

  data = (index: number, size: number, query: any) =>
    this.namespaceService.getList(index, size, query).pipe(
      map((x: any) => x)
    );

  columns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.4, left: 0 },
    { id: 'actions', label: '操作', width: 150 },
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'prefix', label: '前缀', flex: 0.5, sort: true },
    { id: 'uri', label: 'URI', flex: 1, sort: true },
    { id: 'description', label: '描述', flex: 1, sort: true },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  // Tab management
  tabs = [
    { id: 'ontologies', label: '本体' },
    { id: 'properties', label: '属性' },
    { id: 'qualifiers', label: '限定' },
    { id: 'tags', label: '标签字典' },
  ];
  activeTab = 'ontologies';
  selectedNamespace: any = null;

  // Ontology management
  ontologyDataLoaded = false;
  ontologyData: any[] = [];
  ontologyActions: XTreeAction[] = [
    {
      id: 'info',
      label: '查看',
      icon: 'fto-eye',
      handler: (node: any) => {
        this.handleOntologyAction('info', node);
      },
    },
    {
      id: 'edit',
      label: '修改',
      icon: 'fto-edit',
      handler: (node: any) => {
        this.handleOntologyAction('edit', node);
      },
    },
    {
      id: 'delete',
      label: '删除',
      icon: 'fto-trash-2',
      handler: (node: any) => {
        this.handleOntologyAction('delete', node);
      },
    },
  ];

  // Property management
  propertyDataLoaded = false;
  propertyData: any;
  propertyColumns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.4, left: 0 },
    { id: 'actions', label: '操作', width: 150 },
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'description', label: '描述', flex: 1.5, sort: true },
    { id: 'type', label: '值类型', flex: 1, sort: true },
  ];
  propertyPageSize = 10;
  propertyPageIndex = 1;

  // Qualifier management
  qualifierDataLoaded = false;
  qualifierData: any;
  qualifierColumns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.4, left: 0 },
    { id: 'actions', label: '操作', width: 150 },
    { id: 'label', label: '名称', flex: 0.8, sort: true },
    { id: 'description', label: '描述', flex: 1.5, sort: true },
    { id: 'type', label: '值类型', flex: 1, sort: true },
  ];
  qualifierPageSize = 10;
  qualifierPageIndex = 1;

  // Tag dictionary management
  tagDataLoaded = false;
  tagData: any;
  tagColumns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.4, left: 0 },
    { id: 'actions', label: '操作', width: 150 },
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'type', label: '类型', flex: 1, sort: true },
  ];
  tagPageSize = 10;
  tagPageIndex = 1;

  // Added for namespace dropdown
  selectedNamespaceId: string | null = null;
  namespaceOptions: { label: string; value: string }[] = [];
  namespaces: Namespace[] = [];

  constructor(
    private namespaceService: NamespaceService,
    public override indexService: IndexService,
    private ontologyService: OntologyService,
    private propertyService: PropertyService,
    private qualifyService: QualifyService,
    private tagService: TagService,
    private message: XMessageService,
    private msgBox: XMessageBoxService,  // Add message box service
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
  }

  ngOnInit() {
    this.loadNamespaces();
  }

  // Load namespaces for the dropdown
  loadNamespaces() {
    this.namespaceService.getList(1, 1000).subscribe({
      next: (response: any) => {
        this.namespaces = response.list || [];
        // Create options for the dropdown with ID as the value
        this.namespaceOptions = this.namespaces
          .filter(ns => ns.name && ns.id !== undefined && ns.id !== null)
          .map(ns => ({
            label: ns.name as string,
            value: String(ns.id) // Using ID as the value for the dropdown
          }));
        
        // Find and select the default namespace automatically
        const defaultNamespace = this.namespaces.find(ns => ns.name === 'default');
        if (defaultNamespace) {
          console.log('Found default namespace:', defaultNamespace);
          // Set both the ID for the dropdown and the full namespace object
          this.selectedNamespaceId = String(defaultNamespace.id);
          this.selectedNamespace = defaultNamespace;
          
          // Give the UI a chance to update before loading data
          setTimeout(() => {
            this.switchTab(this.activeTab);
            this.message.success(`已选择命名空间: ${defaultNamespace.name}`);
          }, 100);
        } else {
          console.log('Default namespace not found');
          // If no default namespace exists, just select the first one
          if (this.namespaces.length > 0) {
            const firstNamespace = this.namespaces[0];
            this.selectedNamespaceId = String(firstNamespace.id);
            this.selectedNamespace = firstNamespace;
            
            // Give the UI a chance to update before loading data
            setTimeout(() => {
              this.switchTab(this.activeTab);
              this.message.success(`已选择命名空间: ${firstNamespace.name}`);
            }, 100);
          }
        }
      },
      error: (error) => {
        console.error('Failed to load namespaces:', error);
        this.message.error('加载命名空间失败');
      }
    });
  }

  // Handle namespace selection from dropdown
  onNamespaceSelected(namespaceId: string) {
    if (!namespaceId) {
      this.selectedNamespace = null;
      this.clearTabData();
      return;
    }
    
    // Find namespace by ID instead of name
    const selectedNs = this.namespaces.find(ns => String(ns.id) === String(namespaceId));
    
    if (selectedNs) {
      this.selectedNamespace = selectedNs;
      console.log('Selected namespace by ID:', selectedNs);
      this.switchTab(this.activeTab);
      this.message.success(`已选择命名空间: ${selectedNs.name}`);
    } else {
      console.error('Namespace not found with ID:', namespaceId);
      this.message.error('未找到对应的命名空间');
    }
  }

  // Clear all tab data
  clearTabData() {
    this.ontologyDataLoaded = false;
    this.propertyDataLoaded = false;
    this.qualifierDataLoaded = false;
    this.tagDataLoaded = false;
  }

  // Namespace methods
  searchName(name: any) {
    this.query.filter = [{ field: 'name', value: name as string }];
    this.tableCom.change(1);
  }

  searchPrefix(prefix: any) {
    this.query.filter = [{ field: 'prefix', value: prefix as string }];
    this.tableCom.change(1);
  }

  searchDescription(description: any) {
    this.query.filter = [{ field: 'description', value: description as string }];
    this.tableCom.change(1);
  }

  // Namespace selection and tab switching
  selectNamespace(namespace: Namespace) {
    this.selectedNamespace = namespace;
    this.message.success(`已选择命名空间: ${namespace.name}`);
    this.switchTab('ontologies');
  }

  clearSelectedNamespace() {
    this.selectedNamespace = null;
    this.ontologyDataLoaded = false;
    this.propertyDataLoaded = false;
    this.qualifierDataLoaded = false;
    this.tagDataLoaded = false;
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    this.loadTabData(tabId);
  }

  loadTabData(tabId: string) {
    if (!this.selectedNamespace) {
      this.message.warning('请先选择一个命名空间');
      return;
    }

    console.log(`Loading data for tab ${tabId} with namespace:`, this.selectedNamespace);

    switch (tabId) {
      case 'ontologies':
        this.loadOntologyData();
        break;
      case 'properties':
        this.loadPropertyData();
        break;
      case 'qualifiers':
        this.loadQualifierData();
        break;
      case 'tags':
        this.loadTagData();
        break;
    }
  }

  // Ontology data loading and actions
  loadOntologyData() {
    this.ontologyDataLoaded = false;

    const filter = this.selectedNamespace.name === 'default'
      ? [{ field: 'namespaceId', value: '', operation: 'isNull' as XOperation }]
      : [{ field: 'namespaceId', value: this.selectedNamespace.id.toString() }];

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
          this.ontologyData = response.list;
          this.ontologyDataLoaded = true;
        },
        error: (error) => {
          console.error('Failed to load ontology data:', error);
          this.message.error('加载本体数据失败');
        }
      });
  }

  handleOntologyAction(type: string, item: any) {
    switch (type) {
      case 'info':
        // Display ontology details in a modal or panel
        this.message.info(`查看本体: ${item.label || item.name}`);
        break;
      case 'edit':
        // Open ontology edit form
        this.message.info(`编辑本体: ${item.label || item.name}`);
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除本体 "${item.label || item.name}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.ontologyService.delete(item.id).subscribe({
                next: () => {
                  this.message.success(`删除本体成功`);
                  this.loadOntologyData(); // Reload data
                },
                error: (error) => {
                  console.error('Failed to delete ontology:', error);
                  this.message.error('删除本体失败');
                }
              });
            }
          }
        });
        break;
    }
  }

  // Property data loading and actions
  loadPropertyData() {
    this.propertyDataLoaded = false;
    this.propertyData = (index: number, size: number, query: any) => {
      const filter = this.selectedNamespace.name === 'default'
        ? [{ field: 'namespaceId', value: '', operation: 'isNull' as XOperation }]
        : [{ field: 'namespaceId', value: this.selectedNamespace.id.toString() }];

      const finalQuery = {
        ...query,
        filter: [
          ...(query.filter || []),
          ...filter
        ]
      };
      return this.propertyService.getList(index, size, finalQuery);
    };
    this.propertyDataLoaded = true;
  }

  handlePropertyAction(type: string, item: any) {
    switch (type) {
      case 'info':
        this.message.info(`查看属性: ${item.name}`);
        break;
      case 'edit':
        this.message.info(`编辑属性: ${item.name}`);
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除属性 "${item.name}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if ( action === 'confirm') {
              this.propertyService.delete(item.id).subscribe({
                next: () => {
                  this.message.success(`删除属性成功`);
                  this.loadPropertyData(); // Reload data
                },
                error: (error) => {
                  console.error('Failed to delete property:', error);
                  this.message.error('删除属性失败');
                }
              });
            }
          }
        });
        break;
    }
  }

  // Qualifier data loading and actions
  loadQualifierData() {
    this.qualifierDataLoaded = false;
    this.qualifierData = (index: number, size: number, query: any) => {
      const filter = this.selectedNamespace.name === 'default'
        ? [{ field: 'namespaceId', value: '', operation: 'isNull' as XOperation }]
        : [{ field: 'namespaceId', value: this.selectedNamespace.id.toString() }];

      const finalQuery = {
        ...query,
        filter: [
          ...(query.filter || []),
          ...filter
        ]
      };
      return this.qualifyService.getList(index, size, finalQuery);
    };
    this.qualifierDataLoaded = true;
  }

  handleQualifierAction(type: string, item: any) {
    switch (type) {
      case 'info':
        this.message.info(`查看限定: ${item.label}`);
        break;
      case 'edit':
        this.message.info(`编辑限定: ${item.label}`);
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除限定 "${item.label}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.qualifyService.delete(item.id).subscribe({
                next: () => {
                  this.message.success(`删除限定成功`);
                  this.loadQualifierData(); // Reload data
                },
                error: (error) => {
                  console.error('Failed to delete qualifier:', error);
                  this.message.error('删除限定失败');
                }
              });
            }
          }
        });
        break;
    }
  }

  // Tag data loading and actions
  loadTagData() {
    this.tagDataLoaded = false;
    this.tagData = (index: number, size: number, query: any) => {
      const filter = this.selectedNamespace.name === 'default'
        ? [{ field: 'namespaceId', value: '', operation: 'isNull' as XOperation }]
        : [{ field: 'namespaceId', value: this.selectedNamespace.id.toString() }];

      const finalQuery = {
        ...query,
        filter: [
          ...(query.filter || []),
          ...filter
        ]
      };
      return this.tagService.getList(index, size, finalQuery);
    };
    this.tagDataLoaded = true;
  }

  handleTagAction(type: string, item: any) {
    switch (type) {
      case 'info':
        this.message.info(`查看标签: ${item.name}`);
        break;
      case 'edit':
        this.message.info(`编辑标签: ${item.name}`);
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除标签 "${item.name}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.tagService.delete(item.id).subscribe({
                next: () => {
                  this.message.success(`删除标签成功`);
                  this.loadTagData(); // Reload data
                },
                error: (error) => {
                  console.error('Failed to delete tag:', error);
                  this.message.error('删除标签失败');
                }
              });
            }
          }
        });
        break;
    }
  }

  // Add new entity based on active tab
  addEntity(type: string) {
    switch (type) {
      case 'ontology':
        // Open form to add new ontology
        this.message.info('添加新本体');
        break;
      case 'property':
        // Open form to add new property
        this.message.info('添加新属性');
        break;
      case 'qualifier':
        // Open form to add new qualifier
        this.message.info('添加新限定');
        break;
      case 'tag':
        // Open form to add new tag
        this.message.info('添加新标签');
        break;
    }
  }

  // Override action method to refresh namespace dropdown after changes
  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        this.router.navigate([`./${type}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'info':
        this.router.navigate([`./${type}/${item.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'edit':
        this.router.navigate([`./${type}/${item.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'delete':
        if (item.name === 'default') {
          this.message.warning('默认命名空间不能删除！');
          return;
        }
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${item.name}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.namespaceService.delete(item.id).subscribe(() => {
                this.message.success('删除成功！');

                // Refresh namespace list
                this.loadNamespaces();

                // If currently selected namespace is deleted, clear selection
                if (this.selectedNamespace && this.selectedNamespace.id === item.id) {
                  this.selectedNamespace = null;
                  this.selectedNamespaceId = null;
                  this.clearTabData();
                }
              });
            }
          }
        });
        break;
    }
  }
}
