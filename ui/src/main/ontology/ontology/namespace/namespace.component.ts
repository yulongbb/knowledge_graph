import { PageBase } from 'src/share/base/base-page';
import { Component, OnInit } from '@angular/core';
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
import { Schema, OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { PropertyService } from 'src/main/ontology/ontology/property/property.service';
import { QualifyService } from 'src/main/ontology/ontology/qualify/qualify.service';
import { TagService } from 'src/main/ontology/ontology/tag/tag.service';

@Component({
  selector: 'app-namespace',
  templateUrl: 'namespace.component.html',
  styleUrls: ['./namespace.component.scss'],
})
export class NamespaceComponent extends PageBase implements OnInit {
  // Keep only entity management properties
  formGroup = new UntypedFormGroup({});
  name = '';
  prefix = '';
  description = '';
  type = 'add';
  loading = true;

  // Tab management
  tabs = [
    { id: 'ontologies', label: '本体' },
    { id: 'properties', label: '属性' },
    { id: 'qualifiers', label: '限定' },
    { id: 'tags', label: '字典字典' },
  ];
  activeTab = 'ontologies';

  // Property management
  propertyDataLoaded = false;
  propertyData: any;
  propertyColumns: XTableColumn[] = [
    { id: 'name', label: '名称', sort: true },
    { id: 'actions', label: '操作', width: 150 },
  ];
  propertyPageSize = 100;
  propertyPageIndex = 1;

  // Qualifier management
  qualifierDataLoaded = false;
  qualifierData: any;
  qualifierColumns: XTableColumn[] = [
    { id: 'label', label: '名称', sort: true },
    { id: 'actions', label: '操作', width: 100 },
  ];
  qualifierPageSize = 100;
  qualifierPageIndex = 1;

  // Tag dictionary management
  tagDataLoaded = false;
  tagData: any;
  tagColumns: XTableColumn[] = [
    { id: 'name', label: '名称', sort: true },
    { id: 'actions', label: '操作', width: 100 },
  ];
  tagPageSize = 100;
  tagPageIndex = 1;

  // Add property for ontologyId from route
  ontologyId: string | null = null;

  // Add to class properties
  ontologyForm = new UntypedFormGroup({});
  ontologyControls: XControl[] = [
    { control: 'input', id: 'name', label: '名称', required: true },
    { control: 'textarea', id: 'description', label: '描述' },
    { control: 'input', id: 'label', label: '字典' },
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
    { control: 'input', id: 'name', label: '名称', required: true },
    { control: 'textarea', id: 'description', label: '描述' },
    {
      control: 'select',
      id: 'type',
      label: '值类型',
      required: true,
      data: [
        { label: 'commonsMedia', value: 'string' },
        { label: 'external-id', value: 'string' },
        { label: 'string', value: 'string' },
        { label: 'url', value: 'string' },
        { label: 'math', value: 'string' },
        { label: 'monolingualtext', value: 'monolingualtext' },
        { label: 'musical-notation', value: 'string' },
        { label: 'globe-coordinate', value: 'globecoordinate' },
        { label: 'quantity', value: 'quantity' },
        { label: 'time', value: 'time' },
        { label: 'tabular-data', value: 'string' },
        { label: 'geo-shape', value: 'string' },
        { label: 'wikibase-item', value: 'wikibase-entityid' },
        { label: 'wikibase-property', value: 'wikibase-entityid' },
        { label: 'wikibase-lexeme', value: 'wikibase-entityid' },
        { label: 'wikibase-form', value: 'wikibase-entityid' },
        { label: 'wikibase-sense', value: 'wikibase-entityid' }
      ],
    },
    { control: 'input', id: 'group', label: '分组' },
    { control: 'switch', id: 'isPrimary', label: '是否为主属性' },
  ];

  // Add qualifier form related variables
  qualifierFormMode: 'add' | 'edit' | 'view' | null = null;
  qualifierForm = new UntypedFormGroup({});
  qualifierControls: XControl[] = [
    { control: 'input', id: 'label', label: '名称', required: true },
    { control: 'textarea', id: 'description', label: '描述' },
    {
      control: 'select',
      id: 'type',
      label: '值类型',
      required: true,
      data: [
        { label: 'commonsMedia', value: 'string' },
        { label: 'external-id', value: 'string' },
        { label: 'string', value: 'string' },
        { label: 'url', value: 'string' },
        { label: 'math', value: 'string' },
        { label: 'monolingualtext', value: 'monolingualtext' },
        { label: 'musical-notation', value: 'string' },
        { label: 'globe-coordinate', value: 'globecoordinate' },
        { label: 'quantity', value: 'quantity' },
        { label: 'time', value: 'time' },
        { label: 'tabular-data', value: 'string' },
        { label: 'geo-shape', value: 'string' },
        { label: 'wikibase-item', value: 'wikibase-entityid' },
        { label: 'wikibase-qualify', value: 'wikibase-entityid' },
        { label: 'wikibase-lexeme', value: 'wikibase-entityid' },
        { label: 'wikibase-form', value: 'wikibase-entityid' },
        { label: 'wikibase-sense', value: 'wikibase-entityid' }
      ],
    },
  ];

  // Add tag form related variables
  tagFormMode: 'add' | 'edit' | 'view' | null = null;
  tagForm = new UntypedFormGroup({});
  tagControls: XControl[] = [
    { control: 'input', id: 'name', label: '名称', required: true },
    {
      control: 'select',
      id: 'type',
      label: '类型',
      required: true,
      data: [
        { label: 'string', value: 'string' },
        { label: 'monolingualtext', value: 'monolingualtext' },
        { label: 'globecoordinate', value: 'globecoordinate' },
        { label: 'quantity', value: 'quantity' },
        { label: 'time', value: 'time' },
        { label: 'wikibase-entityid', value: 'wikibase-entityid' }
      ],
    },
  ];

  // 新增本体编辑相关属性
  ontologyEditMode: boolean = false;
  editingOntologyId: string | null = null;
  editingOntology: Schema | null = null;
  selectedOntology: any = null;
  selectedProperty: any = null;
  qualifierLoading: boolean   = false;
  hasQualifiers: boolean = false;
  tagLoading: boolean = false;
  hasTags: boolean = false;
  hasProperties: boolean = false;
  propertyLoading: boolean  = false;

  constructor(
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
    // Only load ontologyId from route
    this.activatedRoute.paramMap.subscribe(params => {
      this.ontologyId = params.get('id');
      if (this.ontologyId) {
        this.ontologyEditMode = true;
        this.editingOntologyId = this.ontologyId;
        this.loadOntologyForEdit(this.ontologyId);
      } else {
        this.ontologyEditMode = false;
        this.editingOntologyId = null;
      }
    });
  }

  // 加载本体数据用于编辑
  loadOntologyForEdit(id: string) {
    this.ontologyService.get(id).subscribe({
      next: (ontology: Schema) => {
        this.editingOntology = ontology;
        this.ontologyForm.patchValue({
          name: ontology['name'],
          label: ontology['label'],
          description: ontology['description'],
          namespace: ontology['namespaceId'] || '',
        });
      },
      error: (err: any) => {
        this.message.error('加载本体失败');
      }
    });
  }

  // 保存本体
  saveOntology() {
    if (this.ontologyForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }
    const formData = this.ontologyForm.value;
    const updateData = {
      ...this.editingOntology,
      ...formData,
      namespaceId: formData.namespace,
    };
    this.ontologyService.put(updateData).subscribe({
      next: () => {
        this.message.success('本体保存成功');
        this.router.navigate(['/index/ontology']);
      },
      error: (err: any) => {
        this.message.error('保存本体失败');
      }
    });
  }

  // 取消本体编辑
  cancelOntologyEdit() {
    this.router.navigate(['/index/ontology']);
  }

  // Clear all tab data
  clearTabData() {
    this.clearPropertyData();
    this.clearQualifierData();
    this.clearTagData();
    this.selectedOntology = null;
    this.selectedProperty = null;
  }

  // Namespace methods
  // Remove table-related methods
  // searchName(name: any) {
  //   this.query.filter = [{ field: 'name', value: name as string }];
  //   this.tableCom.change(1);
  // }

  // searchPrefix(prefix: any) {
  //   this.query.filter = [{ field: 'prefix', value: prefix as string }];
  //   this.tableCom.change(1);
  // }

  // searchDescription(description: any) {
  //   this.query.filter = [
  //     { field: 'description', value: description as string },
  //   ];
  //   this.tableCom.change(1);
  // }

  // Namespace selection and tab switching
  switchTab(tabId: string) {
    this.activeTab = tabId;
    this.loadTabData(tabId);
  }

  loadTabData(tabId: string) {
    if (!this.selectedOntology) {
      this.message.warning('请先选择一个本体');
      return;
    }

    console.log(
      `Loading data for tab ${tabId} with ontology:`,
      this.selectedOntology
    );

    switch (tabId) {
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
      error: (error: any) => {
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
      error: (error: any) => {
        console.error('Failed to load tags for property:', error);
        this.message.error('加载属性字典失败');
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
      return this.propertyService.getList(index, size, query);
    };
    this.propertyDataLoaded = true;
  }

  // Qualifier data loading and actions
  loadQualifierData() {
    this.qualifierDataLoaded = false;
    this.qualifierData = (index: number, size: number, query: any) => {
      const finalQuery = {
        ...query,
        filter: [...(query.filter || [])],
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
          namespace: null,
          namespaceId: null,
          properties: this.selectedProperty ? [this.selectedProperty] : [],
        });
        break;

      case 'edit':
        this.qualifierFormMode = 'edit';
        this.qualifierForm.reset();

        this.qualifyService.get(item.id).subscribe((data: any) => {
          this.qualifierForm.patchValue({
            ...data,
            namespace: data.namespaceId,
          });
        });
        break;

      case 'info':
        this.qualifierFormMode = 'view';
        this.qualifierForm.reset();

        this.qualifyService.get(item.id).subscribe((data: any) => {
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
                error: (error:any) => {
                  console.error('Failed to delete qualifier:', error);
                  this.message.error('删除限定失败');
                },
              });
            }
          },
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
    };

    if (this.qualifierFormMode === 'add') {
      console.log('Adding new qualifier with data:', qualifierData);
      this.qualifyService.post(qualifierData).subscribe({
        next: () => {
          this.message.success('新增限定成功');
          this.cancelQualifierForm();
          this.loadQualifiersForProperty(this.selectedProperty);
        },
        error: (error:any) => {
          console.error('Failed to add qualifier:', error);
          this.message.error('新增限定失败: ' + error.message);
        },
      });
    } else if (this.qualifierFormMode === 'edit') {
      this.qualifyService.put(qualifierData).subscribe({
        next: () => {
          this.message.success('编辑限定成功');
          this.cancelQualifierForm();
          this.loadQualifiersForProperty(this.selectedProperty);
        },
        error: (error:any) => {
          console.error('Failed to edit qualifier:', error);
          this.message.error('编辑限定失败: ' + error.message);
        },
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
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
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
        this.message.info('添加新字典');
        break;
    }
  }



  // Add methods to handle communication with ontology tree component
  onOntologySelected(ontology: any) {
    this.selectedOntology = ontology;
    this.selectedProperty = null;
    this.clearQualifierData();
    this.clearTagData();
    this.loadPropertiesForOntology(ontology);
  }

  onOntologyDataLoaded(loaded: boolean) {
    // Handle any logic needed when ontology data is loaded/unloaded
    if (!loaded) {
      this.selectedOntology = null;
      this.selectedProperty = null;
      this.clearPropertyData();
      this.clearQualifierData();
      this.clearTagData();
    }
  }

  // Tag data loading and actions
  loadTagData() {
    this.tagDataLoaded = false;
    this.tagData = (index: number, size: number, query: any) => {
      return this.tagService.getList(index, size, query);
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
      error: (error:any) => {
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

        // 获取属性类型，找到对应的字典类型
        let tagType = '';
        if (this.selectedProperty && this.selectedProperty.type) {
          const typeMap: Record<string, string> = {
            'commonsMedia': 'string',
            'external-id': 'string',
            'string': 'string',
            'url': 'string',
            'math': 'string',
            'monolingualtext': 'monolingualtext',
            'musical-notation': 'string',
            'globe-coordinate': 'globecoordinate',
            'quantity': 'quantity',
            'time': 'time',
            'tabular-data': 'string',
            'geo-shape': 'string',
            'wikibase-item': 'wikibase-entityid',
            'wikibase-qualify': 'wikibase-entityid',
            'wikibase-lexeme': 'wikibase-entityid',
            'wikibase-form': 'wikibase-entityid',
            'wikibase-sense': 'wikibase-entityid'
          };
          tagType = typeMap[this.selectedProperty.type] || '';
        }

        this.tagForm.patchValue({
          id: newId,
          namespace: null,
          namespaceId: null,
          properties: this.selectedProperty ? [this.selectedProperty] : [],
          type: tagType
        });

        // 强制触发 type 控件的 disable 和 value 赋值
        setTimeout(() => {
          const typeControl = this.tagForm.get('type');
          if (typeControl) {
            typeControl.setValue(tagType);
            typeControl.disable();
          }
        });

        break;

      case 'edit':
        this.tagFormMode = 'edit';
        this.tagForm.reset();

        this.tagService.get(item.id).subscribe((data: any) => {
          this.tagForm.patchValue({
            ...data,
            namespace: data.namespaceId,
          });
          const typeControlEdit = this.tagForm.get('type');
          if (typeControlEdit) typeControlEdit.disable();
        });
        break;

      case 'info':
        this.tagFormMode = 'view';
        this.tagForm.reset();

        this.tagService.get(item.id).subscribe((data: any) => {
          this.tagForm.patchValue(data);
          // 强制设置 type 控件的值并禁用，确保选中正确类型
          setTimeout(() => {
            const typeControlInfo = this.tagForm.get('type');
            if (typeControlInfo) {
              typeControlInfo.setValue(data.type || '');
              typeControlInfo.disable();
            }
          });
        });
        break;

      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除字典 "${item.name}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.tagService.delete(item.id).subscribe({
                next: () => {
                  this.message.success('删除字典成功');
                  this.loadTagsForProperty(this.selectedProperty);
                },
                error: (error:any) => {
                  console.error('Failed to delete tag:', error);
                  this.message.error('删除字典失败');
                },
              });
            }
          },
        });
        break;
    }
  }

  saveTag() {
    if (this.tagForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    // 保存前恢复 type 控件可编辑（防止后续操作受影响）
    const typeControl = this.tagForm.get('type');
    if (typeControl) typeControl.enable();

    const formData = this.tagForm.value;
    const tagData = {
      ...formData,
      properties: this.selectedProperty ? [this.selectedProperty] : [],
    };

    if (this.tagFormMode === 'add') {
      this.tagService.post(tagData).subscribe({
        next: () => {
          this.message.success('新增字典成功');
          this.cancelTagForm();
          this.loadTagsForProperty(this.selectedProperty);
        },
        error: (error:any) => {
          console.error('Failed to add tag:', error);
          this.message.error('新增字典失败: ' + error.message);
        },
      });
    } else if (this.tagFormMode === 'edit') {
      this.tagService.put(tagData).subscribe({
        next: () => {
          this.message.success('编辑字典成功');
          this.cancelTagForm();
          this.loadTagsForProperty(this.selectedProperty);
        },
        error: (error:any) => {
          console.error('Failed to edit tag:', error);
          this.message.error('编辑字典失败: ' + error.message);
        },
      });
    }
  }

  cancelTagForm() {
    this.tagFormMode = null;
    this.tagForm.reset();
    // 恢复 type 控件可编辑
    const typeControl = this.tagForm.get('type');
    if (typeControl) typeControl.enable();
  }

  private generateUniqueTagId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `tag-${timestamp}-${randomPart}`;
  }

  // Add missing property handling methods
  handlePropertyAction(type: string, item?: any) {
    switch (type) {
      case 'add':
        this.propertyFormMode = 'add';
        this.propertyForm.reset();

        this.propertyForm.patchValue({
          namespace: null,
          namespaceId: null,
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
        this.propertyService.get(item.id).subscribe((data: any) => {
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
                error: (error:any) => {
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

  saveProperty() {
    if (this.propertyForm.invalid) {
      this.message.warning('请填写必填字段');
      return;
    }

    const formData = this.propertyForm.value;

    if (this.selectedOntology && !formData.schemas) {
      formData.schemas = [this.selectedOntology];
    }

    const propertyData = {
      ...formData,
    };

    if (this.propertyFormMode === 'add') {
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
        error: (error:any) => {
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
        error: (error:any) => {
          console.error('Failed to edit property:', error);
          this.message.error('编辑属性失败: ' + error.message);
        },
      });
    }
  }

  cancelPropertyForm() {
    this.propertyFormMode = null;
    this.propertyForm.reset();
  }

  private generateUniquePropertyId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `prop-${timestamp}-${randomPart}`;
  }
}
 
      