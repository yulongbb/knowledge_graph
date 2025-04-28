import { PageBase } from 'src/share/base/base-page';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import {
  XMessageService,
  XQuery,
  XTableColumn,
  XTableComponent,
  XTreeAction,
  XOperation,
  XControl,
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

  query: any;

  data = (index: number, size: number, query: any) =>
    this.namespaceService.getList(index, size, query).pipe(map((x: any) => x));

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
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'actions', label: '操作', width: 150 },
  ];
  propertyPageSize = 10;
  propertyPageIndex = 1;

  // Qualifier management
  qualifierDataLoaded = false;
  qualifierData: any;
  qualifierColumns: XTableColumn[] = [
    { id: 'label', label: '名称', flex: 0.8, sort: true },
    { id: 'actions', label: '操作', width: 150 },
  ];
  qualifierPageSize = 10;
  qualifierPageIndex = 1;

  // Tag dictionary management
  tagDataLoaded = false;
  tagData: any;
  tagColumns: XTableColumn[] = [
    { id: 'name', label: '名称', flex: 0.8, sort: true },
    { id: 'actions', label: '操作', width: 150 },
  ];
  tagPageSize = 10;
  tagPageIndex = 1;

  // Added for namespace dropdown
  selectedNamespaceId: string | null = null;
  namespaceOptions: { label: string; value: string }[] = [];
  namespaces: Namespace[] = [];

  // Add these new properties to the NamespaceComponent class:
  selectedOntology: any = null;
  selectedProperty: any = null;
  isItemProperty = true; // true for item properties (show qualifiers), false for non-item properties (show tags)
  propertyLoading = false;
  qualifierLoading = false;
  tagLoading = false;
  hasProperties = false;
  hasQualifiers = false;
  hasTags = false;

  // Add a new property to track the form mode for ontology (add/edit)
  ontologyFormMode: 'add' | 'edit' | 'view' | null = null;
  ontologyFormData: any = null;

  // Add to class properties
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

  // Add property form related variables
  propertyFormMode: 'add' | 'edit' | 'view' | null = null;
  propertyForm = new UntypedFormGroup({});
  propertyControls: XControl[] = [
    { control: 'input', id: 'id', label: 'ID' , required: true },
    { control: 'input', id: 'name', label: '名称', required: true },
    { control: 'textarea', id: 'description', label: '描述' },
    {
      control: 'select',
      id: 'type',
      label: '值类型',
      required: true,
      data: [
        'commonsMedia',
        'external-id',
        'string',
        'url',
        'math',
        'monolingualtext',
        'musical-notation',
        'globe-coordinate',
        'quantity',
        'time',
        'tabular-data',
        'geo-shape',
        'wikibase-item',
        'wikibase-property',
        'wikibase-lexeme',
        'wikibase-form',
        'wikibase-sense',
      ],
    },
    { control: 'input', id: 'group', label: '分组' },
    { control: 'switch', id: 'isPrimary', label: '是否为主属性' },
  ];

  // Add qualifier form related variables
  qualifierFormMode: 'add' | 'edit' | 'view' | null = null;
  qualifierForm = new UntypedFormGroup({});
  qualifierControls: XControl[] = [
    { control: 'input', id: 'id', label: 'ID' },
    { control: 'input', id: 'label', label: '名称', required: true },
    { control: 'textarea', id: 'description', label: '描述' },
    {
      control: 'select',
      id: 'type',
      label: '值类型',
      required: true,
      data: [
        'commonsMedia',
        'external-id',
        'string',
        'url',
        'math',
        'monolingualtext',
        'musical-notation',
        'globe-coordinate',
        'quantity',
        'time',
        'tabular-data',
        'geo-shape',
        'wikibase-item',
        'wikibase-qualify',
        'wikibase-lexeme',
        'wikibase-form',
        'wikibase-sense',
      ],
    },
    { control: 'switch', id: 'isPrimary', label: '是否为主限定' },
  ];

  // Add tag form related variables
  tagFormMode: 'add' | 'edit' | 'view' | null = null;
  tagForm = new UntypedFormGroup({});
  tagControls: XControl[] = [
    { control: 'input', id: 'id', label: 'ID' },
    { control: 'input', id: 'name', label: '名称', required: true },
    {
      control: 'select',
      id: 'type',
      label: '类型',
      required: true,
      data: ['string', 'number', 'date', 'object', 'array', 'boolean'],
    },
  ];

  constructor(
    private namespaceService: NamespaceService,
    public override indexService: IndexService,
    private ontologyService: OntologyService,
    private propertyService: PropertyService,
    private qualifyService: QualifyService,
    private tagService: TagService,
    private message: XMessageService,
    private msgBox: XMessageBoxService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
  }

  ngOnInit() {
    // Load namespaces for the dropdown in the ontology form
    this.namespaceService.getList(1, 1000).subscribe((response) => {
      const namespaceControl = this.ontologyControls.find(
        (c) => c.id === 'namespace'
      );
      if (namespaceControl) {
        namespaceControl['data'] = (response.list || []).map((ns) => ({
          label: ns.name,
          value: ns.id,
        }));
      }
    });

    // First ensure the default namespace exists, then load all namespaces
    this.namespaceService
      .ensureDefaultNamespace()
      .pipe(
        catchError((error) => {
          console.error('Failed to ensure default namespace:', error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.loadNamespaces();
      });
  }

  // Load namespaces for the dropdown
  loadNamespaces() {
    this.namespaceService
      .getDefault()
      .pipe(
        catchError((error) => {
          console.warn(
            'Could not fetch default namespace directly, falling back to list:',
            error
          );
          return of(null);
        }),
        switchMap((defaultNamespace) => {
          return this.namespaceService.getList(1, 1000).pipe(
            map((response: any) => {
              return { defaultNamespace, response };
            })
          );
        })
      )
      .subscribe({
        next: ({ defaultNamespace, response }) => {
          this.namespaces = response.list || [];
          this.namespaceOptions = this.namespaces.map((ns) => ({
            label: ns.name as string,
            value: String(ns.id),
          }));

          console.log('Namespace options:', this.namespaceOptions);

          if (defaultNamespace) {
            console.log('Using default namespace from API:', defaultNamespace);
            this.selectNamespace(defaultNamespace);
          } else {
            const defaultNs = this.namespaces.find(
              (ns) => ns.name === 'default'
            );
            if (defaultNs) {
              console.log('Found default namespace in list:', defaultNs);
              this.selectNamespace(defaultNs);
            } else if (this.namespaces.length > 0) {
              console.log(
                'No default namespace found, using first one:',
                this.namespaces[0]
              );
              this.selectNamespace(this.namespaces[0]);
            } else {
              console.warn('No namespaces available');
            }
          }
        },
        error: (error) => {
          console.error('Failed to load namespaces:', error);
          this.message.error('加载命名空间失败');
        },
      });
  }

  // Select a namespace and update the dropdown
  private selectNamespace(namespace: Namespace) {
    this.selectedNamespace = namespace;
    this.selectedNamespaceId = String(namespace.name);
    console.log('Selected namespace:', namespace);
    this.loadOntologyData();
  }

  // Handle namespace selection from dropdown
  onNamespaceSelected(namespaceId: string) {
    console.log('Namespace selected from dropdown:', namespaceId);

    if (!namespaceId) {
      this.selectedNamespace = null;
      this.clearTabData();
      return;
    }

    const selectedNs = this.namespaces.find(
      (ns) => String(ns.name) === namespaceId
    );
    if (selectedNs) {
      this.selectedNamespace = selectedNs;
      console.log('Found and set selected namespace:', selectedNs);
      this.loadOntologyData();
      this.message.success(`已选择命名空间: ${selectedNs.name}`);
    } else {
      console.error('Namespace not found with ID:', namespaceId);
      this.message.error('未找到对应的命名空间');
    }
  }

  // Clear all tab data
  clearTabData() {
    this.ontologyDataLoaded = false;
    this.clearPropertyData();
    this.clearQualifierData();
    this.clearTagData();

    this.selectedOntology = null;
    this.selectedProperty = null;
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
    this.query.filter = [
      { field: 'description', value: description as string },
    ];
    this.tableCom.change(1);
  }

  // Namespace selection and tab switching
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

    console.log(
      `Loading data for tab ${tabId} with namespace:`,
      this.selectedNamespace
    );

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

    const filter =
      this.selectedNamespace.name === 'default'
        ? [
            {
              field: 'namespaceId',
              value: '',
              operation: 'isNull' as XOperation,
            },
          ]
        : [
            {
              field: 'namespaceId',
              value: this.selectedNamespace.id.toString(),
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
          // Enhance ontology data with icons and class names
          this.ontologyData = this.enhanceOntologyData(response.list);
          this.ontologyDataLoaded = true;

          // Clear selected items when loading new ontology data
          this.selectedOntology = null;
          this.selectedProperty = null;
          this.clearPropertyData();
          this.clearQualifierData();
          this.clearTagData();
        },
        error: (error) => {
          console.error('Failed to load ontology data:', error);
          this.message.error('加载本体数据失败');
        },
      });
  }

  /**
   * Enhanced ontology data with icons and classes for better visualization
   */
  enhanceOntologyData(data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];

    // Create a map of all nodes by ID
    const nodeMap = new Map();
    data.forEach((node) => nodeMap.set(node.id, { ...node, children: [] }));

    // Identify root nodes and build hierarchy
    const roots: any[] = [];
    nodeMap.forEach((node) => {
      if (!node.pid) {
        // This is a root node
        node.icon = 'fto-layers'; // Root node icon
        node.className = 'ontology-main';
        roots.push(node);
      } else {
        // This is a child node, add it to its parent
        const parent = nodeMap.get(node.pid);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);

          // Set icon based on whether it has children
          node.className = 'ontology-child';
        }
      }
    });

    // Process the tree to assign leaf node styling
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

  // New method to select an ontology
  selectOntology(ontology: any) {
    console.log('Selected ontology:', ontology);
    this.selectedOntology = ontology;
    this.selectedProperty = null;
    this.ontologyFormMode = null;
    this.clearQualifierData();
    this.clearTagData();
    this.loadPropertiesForOntology(ontology);
  }

  // New method to load qualifiers for a property
  loadQualifiersForProperty(property: any) {
    if (!property) return;

    this.qualifierLoading = true;
    this.qualifierDataLoaded = false;

    // Build a query to find qualifiers related to this property
    const query: any = {
      filter: [
        {
          field: 'id',
          value: property.id,
          relation: 'properties',
          operation: '=' as XOperation,
        },
      ],
    };

    this.qualifyService.getList(1, 100, query).subscribe({
      next: (response: any) => {
        console.log('Qualifiers for property:', response);
        this.qualifierData = response.list || [];
        this.hasQualifiers = this.qualifierData.length > 0;
        this.qualifierDataLoaded = true;
        this.qualifierLoading = false;
      },
      error: (error) => {
        console.error('Failed to load qualifiers for property:', error);
        this.message.error('加载属性限定失败');
        this.qualifierLoading = false;
      },
    });
  }

  // New method to load tags for a property
  loadTagsForProperty(property: any) {
    if (!property) return;

    this.tagLoading = true;
    this.tagDataLoaded = false;

    // Build a query to find tags related to this property
    const query: any = {
      filter: [
        {
          field: 'id',
          value: property.id,
          relation: 'properties',
          operation: '=' as XOperation,
        },
      ],
    };

    this.tagService.getList(1, 100, query).subscribe({
      next: (response: any) => {
        console.log('Tags for property:', response);
        this.tagData = response.list || [];
        this.hasTags = this.tagData.length > 0;
        this.tagDataLoaded = true;
        this.tagLoading = false;
      },
      error: (error) => {
        console.error('Failed to load tags for property:', error);
        this.message.error('加载属性标签失败');
        this.tagLoading = false;
      },
    });
  }

  // Clear methods for the three panels
  clearPropertyData() {
    this.propertyData = [];
    this.propertyDataLoaded = false;
    this.hasProperties = false;
  }

  clearQualifierData() {
    this.qualifierData = [];
    this.qualifierDataLoaded = false;
    this.hasQualifiers = false;
  }

  clearTagData() {
    this.tagData = [];
    this.tagDataLoaded = false;
    this.hasTags = false;
  }

  // Add methods for adding new entities based on selected contexts
  addEntityForOntology(type: string, ontology: any) {
    switch (type) {
      case 'property':
        this.router.navigate(['/index/properties/add'], {
          queryParams: { ontologyId: ontology.id },
        });
        break;
    }
  }

  addEntityForProperty(type: string, property: any) {
    if (!property) return;

    switch (type) {
      case 'qualifier':
        console.log('Adding qualifier for property:', property);
        this.router.navigate(['/index/qualifiers/add'], {
          queryParams: { propertyId: property.id },
        });
        break;
      case 'tag':
        console.log('Adding tag for property:', property);
        this.router.navigate(['/index/tags/add'], {
          queryParams: { propertyId: property.id },
        });
        break;
    }
  }

  // Property data loading and actions
  loadPropertyData() {
    this.propertyDataLoaded = false;
    this.propertyData = (index: number, size: number, query: any) => {
      const filter =
        this.selectedNamespace.name === 'default'
          ? [
              {
                field: 'namespaceId',
                value: '',
                operation: 'isNull' as XOperation,
              },
            ]
          : [
              {
                field: 'namespaceId',
                value: this.selectedNamespace.id.toString(),
              },
            ];

      const finalQuery = {
        ...query,
        filter: [...(query.filter || []), ...filter],
      };
      return this.propertyService.getList(index, size, finalQuery);
    };
    this.propertyDataLoaded = true;
  }

  // Qualifier data loading and actions
  loadQualifierData() {
    this.qualifierDataLoaded = false;
    this.qualifierData = (index: number, size: number, query: any) => {
      const filter =
        this.selectedNamespace.name === 'default'
          ? [
              {
                field: 'namespaceId',
                value: '',
                operation: 'isNull' as XOperation,
              },
            ]
          : [
              {
                field: 'namespaceId',
                value: this.selectedNamespace.id.toString(),
              },
            ];

      const finalQuery = {
        ...query,
        filter: [...(query.filter || []), ...filter],
      };
      console.log('Qualifier query:', finalQuery);
      return this.qualifyService.getList(index, size, finalQuery);
    };
    this.qualifierDataLoaded = true;
  }

  handleQualifierAction(type: string, item: any) {
    switch (type) {
      case 'add':
        const newId = this.generateUniqueQualifierId();
        this.qualifierFormMode = 'add';
        this.qualifierForm.reset();

        this.qualifierForm.patchValue({
          namespace: this.selectedNamespace.id,
          namespaceId: this.selectedNamespace.id,
          properties: this.selectedProperty ? [this.selectedProperty] : [],

        });
        break;

      case 'edit':
        this.qualifierFormMode = 'edit';
        this.qualifierForm.reset();
        
        this.qualifyService.get(item.id).subscribe((data: any) => {
          this.qualifierForm.patchValue({
            ...data,
            namespace: data.namespaceId
          });
        });
        break;

      case 'info':
        this.qualifierFormMode = 'view';
        this.qualifierForm.reset();
        
        this.qualifyService.get(item.id).subscribe((data) => {
          this.qualifierForm.patchValue(data);
        });
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
                  this.message.success('删除限定成功');
                  this.loadQualifiersForProperty(this.selectedProperty);
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

  // Add save qualifier method
  saveQualifier() {
    if (this.qualifierForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    const formData = this.qualifierForm.value;
    const qualifierData = {
      ...formData,
      properties: this.selectedProperty ? [this.selectedProperty] : [],
      namespaceId: formData.namespace || (this.selectedNamespace ? this.selectedNamespace.id : null)
    };

    if (this.qualifierFormMode === 'add') {
      console.log('Adding new qualifier with data:', qualifierData);
      this.qualifyService.post(qualifierData).subscribe({
        next: () => {
          this.message.success('新增限定成功');
          this.cancelQualifierForm();
          this.loadQualifiersForProperty(this.selectedProperty);
        },
        error: (error) => {
          console.error('Failed to add qualifier:', error);
          this.message.error('新增限定失败: ' + error.message);
        }
      });
    } else if (this.qualifierFormMode === 'edit') {
      this.qualifyService.put(qualifierData).subscribe({
        next: () => {
          this.message.success('编辑限定成功');
          this.cancelQualifierForm();
          this.loadQualifiersForProperty(this.selectedProperty);
        },
        error: (error) => {
          console.error('Failed to edit qualifier:', error);
          this.message.error('编辑限定失败: ' + error.message);
        }
      });
    }
  }

  // Add cancel qualifier form method
  cancelQualifierForm() {
    this.qualifierFormMode = null;
    this.qualifierForm.reset();
  }

  // Add method to generate unique qualifier ID
  private generateUniqueQualifierId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `qual-${timestamp}-${randomPart}`;
  }

  // Add new entity based on active tab
  addEntity(type: string) {
    switch (type) {
      case 'ontology':
        this.message.info('添加新本体');
        break;
      case 'property':
        this.message.info('添加新属性');
        break;
      case 'qualifier':
        this.message.info('添加新限定');
        break;
      case 'tag':
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
                if (
                  this.selectedNamespace &&
                  this.selectedNamespace.id === item.id
                ) {
                  this.selectedNamespace = null;
                  this.selectedNamespaceId = null;
                  this.clearTabData();
                }
              });
            }
          },
        });
        break;
    }
  }

  // Update cancelOntologyForm to clear the form
  cancelOntologyForm() {
    this.ontologyFormMode = null;
    this.ontologyForm.reset();
  }

  // Handle ontology actions (modify to use ontologyForm)
  handleOntologyAction(type: string, ontology?: any) {
    switch (type) {
      case 'add':
        // Generate a unique ID for the new ontology
        const newId = this.generateUniqueId();

        this.ontologyFormMode = 'add';
        this.ontologyForm.reset();

        // Pre-select current namespace and set the generated ID
        // If an ontology is selected, make the new one a child of it
        if (this.selectedNamespace) {
          const pidValue = this.selectedOntology
            ? this.selectedOntology.id
            : null;

          this.ontologyForm.patchValue({
            id: newId, // Set the auto-generated ID
            namespace: this.selectedNamespace.id,
            namespaceId: this.selectedNamespace.id,
            pid: pidValue, // Set parent ID if a parent ontology is selected
          });

          console.log('Creating new ontology with ID:', newId);
          if (pidValue) {
            console.log('As child of ontology:', pidValue);
            console.log('Selected parent ontology:', this.selectedOntology);
          }
          console.log('In namespace:', this.selectedNamespace.id);
        }
        break;

      // ...existing code for other cases...
      case 'edit':
        this.ontologyFormMode = 'edit';
        this.ontologyForm.reset();
        this.ontologyService.get(ontology.id).subscribe((data) => {
          this.ontologyForm.patchValue({
            ...data,
            namespace: data['namespaceId'],
          });
        });
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除本体 "${ontology.name || ontology.label}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.ontologyService.delete(ontology.id).subscribe({
                next: () => {
                  this.message.success('删除本体成功');
                  this.loadOntologyData(); // Reload data
                },
                error: (error) => {
                  console.error('Failed to delete ontology:', error);
                  this.message.error('删除本体失败');
                },
              });
            }
          },
        });
        break;
    }
  }

  // Add a method to handle saving ontology data
  saveOntology() {
    if (this.ontologyForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    // Get form data
    const formData = this.ontologyForm.value;

    // Ensure we have an ID
    if (!formData.id && this.ontologyFormMode === 'add') {
      formData.id = this.generateUniqueId();
    }

    // Prepare data for API - ensure namespaceId is set from the namespace dropdown value
    // and preserve the parent ID for hierarchical structure
    const ontologyData = {
      ...formData,
      pid: this.selectedOntology?.id || null, // Ensure pid is included in the data
      namespaceId:
        formData.namespace ||
        (this.selectedNamespace ? this.selectedNamespace.id : null),
    };

    console.log('Saving ontology with data:', ontologyData);

    if (this.ontologyFormMode === 'add') {
      this.ontologyService.post(ontologyData).subscribe({
        next: (newOntology) => {
          this.message.success('新增本体成功');
          this.cancelOntologyForm();

          // If this was added as a child of a selected ontology
          if (ontologyData.pid && this.selectedOntology) {
            this.message.info(
              `已创建为 "${
                this.selectedOntology.name || this.selectedOntology.label
              }" 的子本体`
            );
          }

          this.loadOntologyData();
        },
        error: (error) => {
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
        error: (error) => {
          console.error('Failed to edit ontology:', error);
          this.message.error('编辑本体失败: ' + error.message);
        },
      });
    }
  }

  // Add a method to generate unique IDs
  private generateUniqueId(): string {
    // Generate a random UUID-like string
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ont-${timestamp}-${randomPart}`;
  }

  // Handle property actions - to open forms for add/edit/delete
  handlePropertyAction(type: string, item?: any) {
    switch (type) {
      case 'add':
        // Generate a unique ID for the new property
        const newId = this.generateUniquePropertyId();

        this.propertyFormMode = 'add';
        this.propertyForm.reset();

        // Set default values
        this.propertyForm.patchValue({
          namespace: this.selectedNamespace.id,
          namespaceId: this.selectedNamespace.id,
          schemas: this.selectedOntology ? [this.selectedOntology] : [],
        });
        break;

      case 'edit':
        this.propertyFormMode = 'edit';

        this.propertyService.get(item.id).subscribe((data: any) => {
          this.propertyForm.patchValue({
            ...data,
            namespace: data.namespaceId,
          });
        });
        break;

      case 'info':
        this.propertyFormMode = 'view';
        this.propertyForm.reset();

        this.propertyService.get(item.id).subscribe((data) => {
          this.propertyForm.patchValue(data);
        });
        break;

      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除属性 "${item.name}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.propertyService.delete(item.id).subscribe({
                next: () => {
                  this.message.success('删除属性成功');
                  if (this.selectedOntology) {
                    this.loadPropertiesForOntology(this.selectedOntology);
                  } else {
                    this.loadPropertyData();
                  }
                },
                error: (error) => {
                  console.error('Failed to delete property:', error);
                  this.message.error('删除属性失败');
                },
              });
            }
          },
        });
        break;
    }
  }

  // Save property data
  saveProperty() {
    if (this.propertyForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    // Get form data
    const formData = this.propertyForm.value;

    console.log(formData);

    // Make sure property is associated with the current ontology if selected
    if (this.selectedOntology && !formData.schemas) {
      formData.schemas = [this.selectedOntology];
    }

    const propertyData = {
      ...formData,
      namespaceId:
        formData.namespace ||
        (this.selectedNamespace ? this.selectedNamespace.id : null),
    };

    if (this.propertyFormMode === 'add') {
      console.log('Adding new property with data:', propertyData);
      this.propertyService.post(propertyData).subscribe({
        next: () => {
          this.message.success('新增属性成功');
          this.cancelPropertyForm();

          if (this.selectedOntology) {
            this.loadPropertiesForOntology(this.selectedOntology);
          } else {
            this.loadPropertyData();
          }
        },
        error: (error) => {
          console.error('Failed to add property:', error);
          this.message.error('新增属性失败: ' + error.message);
        },
      });
    } else if (this.propertyFormMode === 'edit') {
      this.propertyService.put(propertyData).subscribe({
        next: () => {
          this.message.success('编辑属性成功');
          this.cancelPropertyForm();

          if (this.selectedOntology) {
            this.loadPropertiesForOntology(this.selectedOntology);
          } else {
            this.loadPropertyData();
          }
        },
        error: (error) => {
          console.error('Failed to edit property:', error);
          this.message.error('编辑属性失败: ' + error.message);
        },
      });
    }
  }

  // Cancel property form
  cancelPropertyForm() {
    this.propertyFormMode = null;
    this.propertyForm.reset();
  }

  // Generate unique property ID
  private generateUniquePropertyId(): string {
    // Generate a random UUID-like string
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `prop-${timestamp}-${randomPart}`;
  }

  // Tag data loading and actions
  loadTagData() {
    this.tagDataLoaded = false;
    this.tagData = (index: number, size: number, query: any) => {
      const filter =
        this.selectedNamespace.name === 'default'
          ? [
              {
                field: 'namespaceId',
                value: '',
                operation: 'isNull' as XOperation,
              },
            ]
          : [
              {
                field: 'namespaceId',
                value: this.selectedNamespace.id.toString(),
              },
            ];

      const finalQuery = {
        ...query,
        filter: [...(query.filter || []), ...filter],
      };
      return this.tagService.getList(index, size, finalQuery);
    };
    this.tagDataLoaded = true;
  }


  // Add methods for adding qualifiers and tags associated with a selected property
  addQualifierForProperty(property: any) {
    if (!property) return;
    console.log('Adding qualifier for property:', property);
    this.router.navigate(['/index/qualifiers/add'], {
      queryParams: { propertyId: property.id },
    });
  }

  addTagForProperty(property: any) {
    if (!property) return;
    console.log('Adding tag for property:', property);
    this.router.navigate(['/index/tags/add'], {
      queryParams: { propertyId: property.id },
    });
  }

  // Modify the property table to trigger the selection event
  loadPropertiesForOntology(ontology: any) {
    if (!ontology) return;

    this.propertyLoading = true;
    this.propertyDataLoaded = false;

    const query: any = {
      filter: [
        {
          field: 'id',
          value: ontology.id,
          relation: 'schemas',
          operation: '=' as XOperation,
        },
      ],
    };

    this.propertyService.getList(1, 100, query).subscribe({
      next: (response: any) => {
        console.log('Properties for ontology:', response);

        // Convert to array if it's not already
        this.propertyData = Array.isArray(response.list) ? response.list : [];

        // Add selected property for UI state tracking
        this.propertyData.forEach((item: any) => {
          item.selected = false;
        });

        this.hasProperties = this.propertyData.length > 0;
        this.propertyDataLoaded = true;
        this.propertyLoading = false;
      },
      error: (error) => {
        console.error('Failed to load properties for ontology:', error);
        this.message.error('加载本体属性失败');
        this.propertyLoading = false;
      },
    });
  }

  // Modify the selectProperty method to handle table row click
  selectProperty(property: any) {
    console.log('Selected property:', property);
    this.selectedProperty = property;

    // Determine if this is an item property (should show qualifiers) or a value property (should show tags)
    // this.isItemProperty = property.type === 'wikibase-item';

    this.loadQualifiersForProperty(property);
    this.loadTagsForProperty(property);
    // if (this.isItemProperty) {
      // this.loadQualifiersForProperty(property);
      // this.clearTagData();
    // } else {
      // this.loadTagsForProperty(property);
      // this.clearQualifierData();
    // }
    // this.loadTagsForProperty(property);
  }

  // Add these methods for tag handling
  handleTagAction(type: string, item: any) {
    switch (type) {
      case 'add':
        const newId = this.generateUniqueTagId();
        this.tagFormMode = 'add';
        this.tagForm.reset();

        this.tagForm.patchValue({
          id: newId,
          namespace: this.selectedNamespace.id,
          namespaceId: this.selectedNamespace.id,
          properties: this.selectedProperty ? [this.selectedProperty] : []
        });
        break;

      case 'edit':
        this.tagFormMode = 'edit';
        this.tagForm.reset();
        
        this.tagService.get(item.id).subscribe((data: any) => {
          this.tagForm.patchValue({
            ...data,
            namespace: data.namespaceId
          });
        });
        break;

      case 'info':
        this.tagFormMode = 'view';
        this.tagForm.reset();
        
        this.tagService.get(item.id).subscribe((data) => {
          this.tagForm.patchValue(data);
        });
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
                  this.message.success('删除标签成功');
                  this.loadTagsForProperty(this.selectedProperty);
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

  saveTag() {
    if (this.tagForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    const formData = this.tagForm.value;
    const tagData = {
      ...formData,
      properties: this.selectedProperty ? [this.selectedProperty] : [],
      namespaceId: formData.namespace || (this.selectedNamespace ? this.selectedNamespace.id : null)
    };

    if (this.tagFormMode === 'add') {
      this.tagService.post(tagData).subscribe({
        next: () => {
          this.message.success('新增标签成功');
          this.cancelTagForm();
          this.loadTagsForProperty(this.selectedProperty);
        },
        error: (error) => {
          console.error('Failed to add tag:', error);
          this.message.error('新增标签失败: ' + error.message);
        }
      });
    } else if (this.tagFormMode === 'edit') {
      this.tagService.put(tagData).subscribe({
        next: () => {
          this.message.success('编辑标签成功');
          this.cancelTagForm();
          this.loadTagsForProperty(this.selectedProperty);
        },
        error: (error) => {
          console.error('Failed to edit tag:', error);
          this.message.error('编辑标签失败: ' + error.message);
        }
      });
    }
  }

  cancelTagForm() {
    this.tagFormMode = null;
    this.tagForm.reset();
  }

  private generateUniqueTagId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `tag-${timestamp}-${randomPart}`;
  }
}
