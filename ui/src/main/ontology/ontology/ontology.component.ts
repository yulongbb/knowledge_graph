import { Component, ElementRef, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { PageBase } from 'src/share/base/base-page';
import { XTreeAction, XTreeComponent, XGuid } from '@ng-nest/ui';
import { XFormRow } from '@ng-nest/ui/form';
import { UntypedFormGroup } from '@angular/forms';
import {
  Schema,
  OntologyService,
} from 'src/main/ontology/ontology/ontology.service';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService, XMessageBoxAction } from '@ng-nest/ui/message-box';
import { ActivatedRoute, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as cytoscape from 'cytoscape';
import { PropertyService } from '../property/property.service';

@Component({
  selector: 'app-ontology',
  templateUrl: 'ontology.component.html',
  styleUrls: ['./ontology.component.scss'],
})
export class OntologyComponent extends PageBase {
  @ViewChild('treeCom') treeCom!: XTreeComponent;
  @ViewChild('form') form!: XFormComponent;
  @ViewChild('cyContainer') cyContainer!: ElementRef; // Reference to the Cytoscape container

  formGroup = new UntypedFormGroup({});

  get disabled() {
    return !['edit', 'add', 'add-root'].includes(this.type);
  }

  type = 'info';

  selected!: Schema;
  treeLoading = true;

  data = () =>
    this.service
      .getList(1, Number.MAX_SAFE_INTEGER, {
        sort: [
          { field: 'pid', value: 'asc' },
          { field: 'sort', value: 'asc' },
        ],
      })
      .pipe(
        tap((x) => (console.log(x))),
        map((x) => x.list)
      );

  treeActions: XTreeAction[] = [
    {
      id: 'add',
      label: '新增',
      icon: 'fto-plus-square',
      handler: (schema: Schema) => {
        this.action('add', schema);
      },
    },
    {
      id: 'edit',
      label: '修改',
      icon: 'fto-edit',
      handler: (schema: Schema) => {
        this.action('edit', schema);
      },
    },
    {
      id: 'properties',
      label: '属性',
      icon: 'fto-list',
      handler: (schema: Schema) => {
        this.action('properties', schema);
      },
    },
    {
      id: 'delete',
      label: '删除',
      icon: 'fto-trash-2',
      handler: (schema: Schema) => {
        this.action('delete', schema);
      },
    },
  ];

  controls: XFormRow[] = [
    {
      controls: [
        {
          control: 'input',
          id: 'id',
          label: 'id',
        },
        {
          control: 'input',
          id: 'name',
          label: '名称',
        },
        {
          control: 'textarea',
          id: 'ontologies',
          label: '类型集合',
        },
        {
          control: 'input',
          id: 'label',
          label: '标签',
        },
        {
          control: 'color-picker',
          id: 'color',
          label: '颜色'
        },
        {
          control: 'input',
          id: 'icon',
          label: '图标',
        },
        { control: 'input', id: 'description', label: '描述' },
        { control: 'input', id: 'collection', label: '表' },
      ],
    },
    {
      hidden: true,
      controls: [
        {
          control: 'input',
          id: 'pid',
        },
      ],
    },
  ];
  cy: any; // Cytoscape instance

  // Add properties to track form mode and data
  ontologyFormMode: 'add' | 'edit' | 'view' | null = null;
  ontologyFormData: any = null;

  constructor(
    private service: OntologyService,
    public propertyService: PropertyService,

    public override indexService: IndexService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  ngAfterViewInit(): void {
    this.initCytoscape(); // Initialize Cytoscape after the view is ready
  }

  // Initialize Cytoscape
  initCytoscape() {
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement, // Render in the container
      style: [
        // Define styles for nodes and edges
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': 'data(color)',
            shape: 'rectangle',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#999',
            'curve-style': 'bezier',
          },
        },
      ],
    });

    // Load initial data
    this.loadCytoscapeData();
  }


  loadCytoscapeData() {
    this.service
      .getList(1, Number.MAX_SAFE_INTEGER)
      .pipe(
        switchMap((res: any) => {
          console.log('Fetched schema list:', res);

          // Create nodes for schemas
          const schemaNodes = res.list.map((item: Schema) => ({
            group: 'nodes',
            data: {
              id: item.id,
              label: item.label,
              type: 'schema', // Add a type to distinguish schema nodes
            },
          }));

          // Fetch properties for each schema in parallel
          const propertyRequests = res.list.map((schema: Schema) => {
            const query:any = {
              filter: [
                {
                  field: 'id',
                  value: [schema.id], // Filter properties by schema ID
                  relation: 'schemas',
                  operation: 'IN',
                },
              ],
            };
            return this.propertyService.getList(1, Number.MAX_SAFE_INTEGER, query).pipe(
              catchError((error) => {
                console.error(`Failed to fetch properties for schema ${schema.id}:`, error);
                return of({ list: [] }); // Return an empty list if the request fails
              })
            );
          });

          console.log('Fetching properties for all schemas:', propertyRequests);

          return forkJoin(propertyRequests).pipe(
            tap((propertyResponses: any) => {
              console.log('Fetched properties for all schemas:', propertyResponses);
            }),
            map((propertyResponses: any) => {
              const elements = [...schemaNodes]; // Start with schema nodes
              const valueNodeMap = new Map<string, any>(); // Map to track unique property value nodes

              // Add property value nodes and property name edges
              propertyResponses.forEach((response: any, index: number) => {
                const schemaId = res.list[index].id; // Corresponding schema ID

                response.list.forEach((property: any) => {
                  const valueNodeId = `${property.type}`; // Unique ID for property value node

                  // Add property value node if it doesn't already exist
                  if (!valueNodeMap.has(valueNodeId)) {
                    const valueNode = {
                      group: 'nodes',
                      data: {
                        id: valueNodeId,
                        label: property.type, // Property value as label
                        type: 'value', // Add a type to distinguish value nodes
                      },
                    };
                    elements.push(valueNode);
                    valueNodeMap.set(valueNodeId, valueNode);
                  }

                  // Add property name edge (schema -> property value)
                  elements.push({
                    group: 'edges',
                    data: {
                      id: `${schemaId}-${property.name}-${valueNodeId}`, // Unique edge ID
                      source: schemaId, // Source node (schema)
                      target: valueNodeId, // Target node (property value)
                      label: property.name, // Property name as edge label
                    },
                  });
                });
              });

              return elements;
            })
          );
        }),
        catchError((error) => {
          console.error('Failed to load schema list:', error);
          this.message.error('Failed to load schema list. Please try again later.');
          return of([]); // Return an empty array if the request fails
        })
      )
      .subscribe((elements: any[]) => {
        // Add all elements to Cytoscape at once
        this.cy.add(elements);

        // Apply a layout to organize the graph
        this.cy.layout({ name: 'cose' }).run();

        // Apply custom styles
        this.applyCytoscapeStyles();
      });
  }

  // Apply custom styles to Cytoscape
  applyCytoscapeStyles() {
    const style = [
      // Style for schema nodes
      {
        selector: 'node[type="schema"]',
        style: {
          label: 'data(label)',
          shape: 'ellipse', // Circular shape
          width: 60,
          height: 60,
          backgroundColor: '#666', // Dark gray background
          color: '#fff', // White text
          fontSize: 12,
          textHalign: 'center',
          textValign: 'center',
          borderWidth: 2,
          borderColor: '#333',
        },
      },

      // Style for property value nodes
      {
        selector: 'node[type="value"]',
        style: {
          label: 'data(label)',
          shape: 'ellipse', // Circular shape
          width: 40,
          height: 40,
          backgroundColor: '#999', // Light gray background
          color: '#000', // Black text
          fontSize: 10,
          textHalign: 'center',
          textValign: 'center',
          borderWidth: 1,
          borderColor: '#666',
        },
      },

      // Style for edges
      {
        selector: 'edge',
        style: {
          width: 2,
          lineColor: '#999',
          curveStyle: 'bezier',
          label: 'data(label)', // Display property name on the edge
          color: '#333', // Edge label color
          fontSize: 10,
          textBackgroundColor: '#fff', // Background for edge labels
          textBackgroundOpacity: 0.8,
          textBorderColor: '#999',
          textBorderWidth: 1,
          textBorderOpacity: 0.8,
        },
      },
    ];

    // Apply the styles to Cytoscape
    this.cy.style(style).update();
  }

  action(type: string, schema: Schema) {
    switch (type) {
      case 'add-root':
        this.selected = schema;
        this.type = type;
        this.formGroup.reset();
        this.formGroup.patchValue({
          id: XGuid(),
          pid: null,
        });
        break;
      case 'add':
        this.selected = schema;
        this.type = type;
        this.formGroup.reset();
        this.formGroup.patchValue({
          id: XGuid(),
          pid: schema.id,
        });
        break;
      case 'save':
        if (this.type === 'add' || this.type === 'add-root') {
          console.log(this.formGroup.value);
          if (this.form.formGroup().value.ontologies) {
            this.form.formGroup().value.ontologies = this.form.formGroup().value.ontologies?.split('\n').filter((t: any) => t != '');
            let arr: any = []
            this.form.formGroup().value.ontologies.forEach((t: any) => {
              arr.push(this.service.post({ id: XGuid(), name: t, label: t, pid: this.selected.id }))
            });
            forkJoin(arr).subscribe(() => {
              this.message.success('新增成功！');
            })
          } else {
            console.log('新增单个');
            this.service.post(this.formGroup.value).subscribe((x) => {
              this.type = 'info';
              console.log(x);
              this.treeCom.addNode(x);
              this.message.success('新增成功！');
            });
          }

        } else if (this.type === 'edit') {
          console.log(this.formGroup.value);
          this.service.put(this.formGroup.value).subscribe(() => {
            this.type = 'info';
            this.treeCom.updateNode(schema, this.formGroup.value);
            this.message.success('修改成功！');
          });
        }
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '提示',
          content: `此操作将永久删除此条数据：${schema.label}，是否继续？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            action === 'confirm' &&
              this.service.delete(schema.id).subscribe(() => {
                console.log(schema);
                this.treeCom.removeNode(schema);
                this.formGroup.reset();
                this.message.success('删除成功！');
              });
          },
        });
        break;
      case 'edit':
        this.selected = schema;
        this.type = type;
        this.service.get(schema?.id).subscribe((x) => {
          this.formGroup.patchValue(x);
        });
        break;
      case 'properties':
        this.router.navigate([`./properties/${schema.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
    }
  }

  // Handle ontology actions
  handleOntologyAction(type: string, ontology?: any) {
    switch (type) {
      case 'add':
        this.ontologyFormMode = 'add';
        this.ontologyFormData = { name: '', description: '' }; // Initialize empty form
        break;
      case 'edit':
        this.ontologyFormMode = 'edit';
        this.ontologyFormData = { ...ontology }; // Populate form with existing data
        break;
      case 'view':
        this.ontologyFormMode = 'view';
        this.ontologyFormData = { ...ontology }; // Populate form with existing data
        break;
      case 'delete':
        this.msgBox.confirm({
          title: '确认删除',
          content: `确定要删除本体 "${ontology.name}" 吗？`,
          type: 'warning',
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              this.service.delete(ontology.id).subscribe({
                next: () => {
                  this.message.success('删除本体成功');
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

  // Save ontology data
  saveOntology() {
    if (this.ontologyFormMode === 'add') {
      this.service.post(this.ontologyFormData).subscribe({
        next: () => {
          this.message.success('新增本体成功');
          this.ontologyFormMode = null;
          this.loadOntologyData(); // Reload data
        },
        error: (error) => {
          console.error('Failed to add ontology:', error);
          this.message.error('新增本体失败');
        }
      });
    } else if (this.ontologyFormMode === 'edit') {
      this.service.put(this.ontologyFormData).subscribe({
        next: () => {
          this.message.success('编辑本体成功');
          this.ontologyFormMode = null;
          this.loadOntologyData(); // Reload data
        },
        error: (error) => {
          console.error('Failed to edit ontology:', error);
          this.message.error('编辑本体失败');
        }
      });
    }
  }

  // Cancel ontology form
  cancelOntologyForm() {
    this.ontologyFormMode = null;
    this.ontologyFormData = null;
  }

  // Load ontology data
  loadOntologyData() {
    this.data = () =>
      this.service
        .getList(1, Number.MAX_SAFE_INTEGER, {
          sort: [
            { field: 'pid', value: 'asc' },
            { field: 'sort', value: 'asc' },
          ],
        })
        .pipe(
          tap((x) => console.log(x)),
          map((x) => x.list)
        );
  }
}
