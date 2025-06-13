import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Query,
  TemplateRef,
  ViewChild,
  signal,
  viewChild,
} from '@angular/core';

import { EntityService } from '../entity/entity.service';
import { Observable } from 'rxjs';
import { EsService } from '../start/search/es.service';

import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import cola from 'cytoscape-cola';
import edgehandles from 'cytoscape-edgehandles';
import cytoscapePopper from 'cytoscape-popper';

import {
  XDialogRef,
  XDialogService,
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XPlace,
} from '@ng-nest/ui';
import { animate, animation } from '@angular/animations';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { PropertyService } from '../ontology/property/property.service';
import { createPopper } from '@popperjs/core';
import { color } from 'echarts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit, OnDestroy {
  @ViewChild('cy', { static: true }) cyContainer!: ElementRef;
  contentTpl = viewChild.required<TemplateRef<void>>('contentTpl');
  properties: any;
  propertyData: any;
  model1: any;
  keyword = '';
  way = '默认检索';
  cy: any;
  visible = signal(false);
  placement = signal<XPlace>('center');
  data: any;


  id: any;
  type: any;

  // New properties for enhanced functionality
  activeTab = 0;
  networkStats = {
    totalNodes: 0,
    totalEdges: 0,
    communities: 0
  };

  communities = [
    { name: '社区 A', color: '#ff6b6b', nodeCount: 26, edgeCount: 306, central: '社区 A' },
    { name: '社区 B', color: '#4ecdc4', nodeCount: 31, edgeCount: 438, central: '社区 B' },
    { name: '社区 C', color: '#45b7d1', nodeCount: 21, edgeCount: 229, central: '社区 C' },
    { name: '社区 D', color: '#96ceb4', nodeCount: 23, edgeCount: 280, central: '社区 D' },
    { name: '社区 E', color: '#feca57', nodeCount: 29, edgeCount: 393, central: '社区 E' },
    { name: '社区 F', color: '#ff9ff3', nodeCount: 16, edgeCount: 167, central: '社区 F' }
  ];

  layoutOptions = [
    { label: '力导向布局', value: 'cose' },
    { label: '弹性布局', value: 'cola' },
    { label: '网格布局', value: 'grid' },
    { label: '圆形布局', value: 'circle' },
    { label: '广度优先布局', value: 'breadthfirst' },
    { label: '同心圆布局', value: 'concentric' }
  ];
  selectedLayout = 'cose';
  showLabels = true;
  showEdgeLabels = true;
  nodeSpacing = 50;

  close() {
    this.visible.set(false);
  }

  evt(type: string) {
    this.id = null;
    this.type = null;
  }
  popperInstances = new Map();

  constructor(
    private service: EntityService,
    private ontologyService: OntologyService,
    public propertyService: PropertyService,
    private esService: EsService,
    private message: XMessageService,
    private router: Router,
    private msgBox: XMessageBoxService
  ) {

  }

  ngOnInit(): void {
    // Load all entities and relationships by default
    this.loadAllGraph();
  }

  loadAllGraph(): void {
    // Load all entities with their relationships
    this.service.getAllGraph(1, 100, {}).subscribe((data: any) => {
      console.log('Loaded all graph data:', data);
      this.initializeCytoscapeWithAllData(data);
    });
  }

  initializeCytoscapeWithAllData(data: any): void {
    cytoscape.use(cxtmenu);
    cytoscape.use(cola);
    cytoscape.use(edgehandles);
    cytoscape.use(cytoscapePopper(createPopper));
    
    this.ontologyService.getList(1, 100, {}).subscribe((schemas: any) => {
      let colors = schemas.list
        .filter((schema: any) => schema.color != null)
        .map((s: any) => {
          return { id: s.id, label: s.label, color: s.color };
        });
      const colorMap: any = {};
      colors.forEach((c: any) => {
        colorMap[c.id] = c.color;
      });

      this.cy = cytoscape({
        container: this.cyContainer.nativeElement,
        style: [
          // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              'border-color': '#ffffff',
              'border-width': 2,
              'background-image': 'data(images)',
              'background-fit': 'cover',
              'background-image-containment': 'over',
              'background-image-opacity': 1,
              color: '#333333',
              label: (ele: any) => {
                const label = ele.data('label');
                return label && label.length > 10 ? label.substring(0, 10) + '...' : label;
              },
              'text-valign': 'bottom',
              'text-margin-y': 6,
              'text-background-color': '#ffffff',
              'text-background-opacity': 0.8,
              'text-background-padding': '3px',
              'text-background-shape': 'roundrectangle',
              'font-size': '12px',
              'text-max-width': '80px',
              'text-wrap': 'ellipsis',
              'text-halign': 'center',
            },
          },
          {
            selector: 'node.hover',
            style: {
              'border-color': '#000000',
              'text-background-color': '#eeeeee',
              'text-background-opacity': 1,
            },
          },
          {
            selector: 'node:selected',
            style: {
              'border-color': '#ff0000',
              'border-width': 6,
              'border-opacity': 0.5,
            },
          },
          {
            selector: 'edge',
            style: {
              width: 1.5,
              'line-color': '#aaa',
              'target-arrow-color': '#aaa',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'text-opacity': 1,
              'overlay-opacity': 0,
              'arrow-scale': 1.2,
              color: '#000',
              label: 'data(label)',
              'font-size': '12px',
              'control-point-weight': 0.5,
              'control-point-distance': 30,
            },
          },
          {
            selector: 'edge.hover',
            style: {
              'line-color': '#999999',
            },
          },
          // edgehandles
          {
            selector: '.eh-handle',
            style: {
              'background-color': 'red',
              'background-image': [],
              width: 12,
              height: 12,
              shape: 'ellipse',
              'overlay-opacity': 0,
              'border-width': 12,
              'border-opacity': 0,
              label: '',
            },
          },
          {
            selector: '.eh-hover',
            style: {
              'background-color': 'red',
            },
          },
          {
            selector: '.eh-source',
            style: {
              'border-width': 2,
              'border-color': 'red',
            },
          },
          {
            selector: '.eh-target',
            style: {
              'border-width': 2,
              'border-color': 'red',
            },
          },
          {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
              'background-color': 'red',
              'line-color': 'red',
              'target-arrow-color': 'red',
              'source-arrow-color': 'red',
            },
          },
          {
            selector: '.eh-ghost-edge.eh-preview-active',
            style: {
              opacity: 0,
            },
          },
        ],

        layout: {
          name: 'cose',
          animate: false,
        },
      });

      // Setup context menus and event handlers
      this.setupCytoscapeEvents();
      
      // Initialize with all data
      this.initializeCytoscape(data);
    });
  }

  setupCytoscapeEvents(): void {
    var eh = this.cy.edgehandles();
    
    this.cy.cxtmenu({
      selector: 'node',
      commands: [
        {
          content: '浏览',
          select: (ele: any) => {
            console.log(ele.data())
            this.id = ele.data().id;
            this.router.navigate(['/index/entity/info', ele.data().id]);
          },
        },

        {
          content: '编辑',
          select: (ele: any) => {
            console.log(ele.data())
            this.id = ele.data().id;
            this.router.navigate(['/index/entity/edit', ele.data().id]);
          },
        },
        {
          content: '连接',
          select: (ele: any) => {
            eh.start(ele);
          },
        },
        {
          content: '删除',
          select: (ele: any) => {
            console.log(ele.position());
            this.msgBox.alert({
              title: '删除弹框',
              content: '知识删除',
              placement: 'center',
              callback: (action: XMessageBoxAction) => {
                console.log(ele.data());
                this.service
                  .deleteItem(ele.data()['id'])
                  .subscribe(() => {
                    ele.remove();
                    this.message.success('删除成功！');
                  });
              },
            });
          },
        },
      ],
    });
    this.cy.cxtmenu({
      selector: 'edge',
      commands: [
        {
          content: '限定',
          select: (ele: any) => {
            console.log(ele.id());
            console.log('添加限定');
          },
        },
        {
          content: '删除',
          select: (ele: any) => {
            this.msgBox.alert({
              title: '删除弹框',
              content: '这是一段内容',
              placement: 'center',
              callback: (action: XMessageBoxAction) => {
                if (action === 'confirm') {
                  ele.remove();
                  this.service
                    .deleteEdge(ele.data()['_id'])
                    .subscribe((e: any) => {
                      this.message.success('关系删除成功');
                    });
                } else if (action === 'close') {
                  this.message.info('已关闭窗口！');
                } else if (action === 'cancel') {
                  this.message.info('已取消窗口！');
                }
              },
            });
          },
        },
      ],
    });

    this.cy.cxtmenu({
      selector: 'core',
      commands: [
        {
          content: '创建知识',
          select: (ele: any) => {
            console.log(ele.data())
            this.router.navigate(['/index/entity/add']);
          },
        },
      ],
    });

    var doubleClickDelayMs = 350;
    var previousTapStamp: any;
    this.cy.on('tap', (ele: any) => {
      var currentTapStamp = ele.timeStamp;
      var msFromLastTap = currentTapStamp - previousTapStamp;
      if (msFromLastTap < doubleClickDelayMs) {
        ele.target.trigger('doubleTap', ele);
      }
      previousTapStamp = currentTapStamp;

    });
    this.cy.on('doubleTap', (ele: any) => {
      var target: any = ele.target;
      if (target == this.cy) {
        console.log('双击空白处');
        console.log(this.cy.nodes());
      } else if (target.isNode()) {
        console.log('双击节点');
        this.service
          .graph(1, 100, target.data().id)
          .subscribe((data: any) => {
            console.log(data);

            this.initializeCytoscape(data);
          });
      } else if (target.isEdge()) {
        console.log('双击边');
      }
    });

    this.cy.on(
      'ehcomplete',
      (event: any, sourceNode: any, targetNode: any, addedEdge: any) => {
        this.esService
          .getEntity(sourceNode.data().id)
          .subscribe((x: any) => {
            this.ontologyService
              .get(x._source.type)
              .subscribe((type: any) => {
                this.ontologyService
                  .getAllParentIds(x._source.type)
                  .subscribe((parents: any) => {
                    parents.push(x._source.type);
                    this.propertyService
                      .getList(1, 50, {
                        filter: [
                          {
                            field: 'id',
                            value: parents as string[],
                            relation: 'schemas',
                            operation: 'IN',
                          },
                        ],
                      })
                      .subscribe((x: any) => {
                        this.propertyData = signal(
                          x.list.filter(
                            (p: any) => p.type == 'wikibase-item'
                          )
                        );
                        this.properties = signal(
                          x.list
                            .filter((p: any) => p.type == 'wikibase-item')
                            .map((p: any) => p.name)
                        );
                      });
                  });
              });
          });
        this.msgBox.alert({
          title: '选择关系',
          content: this.contentTpl(),
          backdropClose: true,
          callback: (action: XMessageBoxAction) => {
            if (action === 'confirm') {
              let property = this.propertyData().filter(
                (p: any) => p.name == this.model1
              )[0];
              let edge = {
                _from: sourceNode.data()['_id'],
                _to: targetNode.data()['_id'],
                mainsnak: {
                  snaktype: 'value',
                  property: `P${property.id}`,
                  datavalue: {
                    value: {
                      'entity-type': 'item',
                      'numeric-id': Number.parseInt(
                        targetNode
                          .data()
                        ['_id'].split('/')[1]
                          .replace('Q', '')
                      ),
                      id: targetNode.data()['_id'].split('/')[1],
                    },
                    type: 'wikibase-entityid',
                  },
                  datatype: 'wikibase-item',
                },
                type: 'statement',
                rank: 'normal',
              };
              this.service.addEdge(edge).subscribe((e: any) => {
                this.message.success('关系创建成功');
                this.cy.add({
                  data: {
                    source: sourceNode.data().id,
                    target: targetNode.data().id,
                    label: property.name,
                  },
                });
                addedEdge.remove();
              });
            } else if (action === 'close') {
              this.message.info('已取消创建关系！');
              addedEdge.remove();
            } else if (action === 'cancel') {
              addedEdge.remove();
              this.message.info('已取消创建关系！');
            }
          },
        });
      }
    );
  }

  // New methods for enhanced functionality
  onTabChange(index: any): void {
    this.activeTab = index;
  }

  updateNetworkStats(): void {
    if (this.cy) {
      this.networkStats.totalNodes = this.cy.nodes().length;
      this.networkStats.totalEdges = this.cy.edges().length;
      this.networkStats.communities = this.communities.length;
    }
  }

  addNode(): void {
    this.router.navigate(['/index/entity/add']);
  }

  createLink(): void {
    // Enable edge creation mode
    if (this.cy) {
      const eh = this.cy.edgehandles();
      eh.enableDrawMode();
    }
  }

  editNode(): void {
    const selected = this.cy.$(':selected');
    if (selected.length > 0 && selected.isNode()) {
      this.router.navigate(['/index/entity/edit', selected.data().id]);
    } else {
      this.message.warning('请先选择一个节点');
    }
  }

  deleteSelection(): void {
    const selected = this.cy.$(':selected');
    if (selected.length > 0) {
      this.msgBox.confirm({
        title: '删除确认',
        content: `确定要删除选中的 ${selected.length} 个元素吗？`,
        callback: (action: XMessageBoxAction) => {
          if (action === 'confirm') {
            selected.remove();
            this.updateNetworkStats();
            this.message.success('删除成功！');
          }
        }
      });
    } else {
      this.message.warning('请先选择要删除的元素');
    }
  }

  showAllStakeholders(): void {
    // Implementation for showing all stakeholders
    console.log('显示所有相关者');
  }

  showRecentActivity(): void {
    // Implementation for showing recent activity
    console.log('显示最近活动');
  }

  showEngagements(): void {
    // Implementation for showing engagements
    console.log('显示参与度分析');
  }

  selectCommunity(community: any): void {
    // Highlight nodes in the selected community
    this.cy.nodes().removeClass('highlighted');
    // Implementation to highlight community nodes
    console.log('选中社区:', community.name);
  }

  changeLayout(layout: string): void {
    this.selectedLayout = layout;
    if (this.cy) {
      this.cy.layout({
        name: layout,
        animate: true,
        animationDuration: 500
      }).run();
    }
  }

  detectCommunities(): void {
    // Implementation for community detection algorithm
    this.message.info('社区检测已开始...');
    // This would typically call a service to detect communities
    console.log('检测社区中...');
  }

  applyLayout(): void {
    if (this.cy) {
      let layoutOptions: any = {
        name: this.selectedLayout,
        animate: true,
        animationDuration: 500
      };

      // Add specific options for different layout types
      switch (this.selectedLayout) {
        case 'cose':
          layoutOptions = {
            ...layoutOptions,
            nodeSpacing: this.nodeSpacing,
            idealEdgeLength: this.nodeSpacing,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
          };
          break;
        case 'cola':
          layoutOptions = {
            ...layoutOptions,
            nodeSpacing: this.nodeSpacing,
            edgeLength: this.nodeSpacing,
            animate: true,
            randomize: false,
            maxSimulationTime: 1500,
            ungrabifyWhileSimulating: false,
            fit: true,
            padding: 30,
            nodeDimensionsIncludeLabels: false,
            flow: { axis: 'y', minSeparation: this.nodeSpacing },
            alignment: undefined,
            gapInequalities: undefined,
            centerGraph: true
          };
          break;
        case 'grid':
          layoutOptions = {
            ...layoutOptions,
            fit: true,
            padding: 30,
            boundingBox: undefined,
            avoidOverlap: true,
            avoidOverlapPadding: 10,
            nodeDimensionsIncludeLabels: false,
            spacingFactor: this.nodeSpacing / 50,
            condense: false,
            rows: undefined,
            cols: undefined,
            position: function(node: any) { return undefined; },
            sort: undefined,
            animate: true,
            animationDuration: 500,
            animationEasing: undefined
          };
          break;
        case 'circle':
          layoutOptions = {
            ...layoutOptions,
            fit: true,
            padding: 30,
            boundingBox: undefined,
            avoidOverlap: true,
            nodeDimensionsIncludeLabels: false,
            spacingFactor: undefined,
            radius: undefined,
            startAngle: 3 / 2 * Math.PI,
            sweep: undefined,
            clockwise: true,
            sort: undefined,
            animate: true,
            animationDuration: 500,
            animationEasing: undefined
          };
          break;
        case 'breadthfirst':
          layoutOptions = {
            ...layoutOptions,
            fit: true,
            directed: false,
            padding: 30,
            circle: false,
            grid: false,
            spacingFactor: this.nodeSpacing / 50,
            boundingBox: undefined,
            avoidOverlap: true,
            nodeDimensionsIncludeLabels: false,
            roots: undefined,
            maximal: false,
            animate: true,
            animationDuration: 500,
            animationEasing: undefined
          };
          break;
        case 'concentric':
          layoutOptions = {
            ...layoutOptions,
            fit: true,
            padding: 30,
            startAngle: 3 / 2 * Math.PI,
            sweep: undefined,
            clockwise: true,
            equidistant: false,
            minNodeSpacing: this.nodeSpacing,
            boundingBox: undefined,
            avoidOverlap: true,
            nodeDimensionsIncludeLabels: false,
            height: undefined,
            width: undefined,
            spacingFactor: undefined,
            concentric: function(node: any) {
              return node.degree();
            },
            levelWidth: function(nodes: any) {
              return nodes.maxDegree() / 4;
            },
            animate: true,
            animationDuration: 500,
            animationEasing: undefined
          };
          break;
      }

      console.log('Applying layout:', this.selectedLayout, 'with options:', layoutOptions);
      
      const layout = this.cy.layout(layoutOptions);
      layout.run();
      
      this.message.success(`已应用${this.layoutOptions.find(l => l.value === this.selectedLayout)?.label}布局`);
    }
  }

  saveToStorage(): void {
    if (this.cy) {
      const data = this.cy.json();
      localStorage.setItem('cytoscapeData', JSON.stringify(data));
      this.message.success('网络已保存到浏览器存储');
    }
  }

  loadFromStorage(): void {
    const savedData = localStorage.getItem('cytoscapeData');
    if (savedData && this.cy) {
      const data = JSON.parse(savedData);
      this.cy.json(data);
      this.updateNetworkStats();
      this.message.success('网络已从浏览器存储加载');
    } else {
      this.message.warning('浏览器存储中未找到保存的网络');
    }
  }

  exportNetwork(): void {
    if (this.cy) {
      const data = this.cy.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'network-export.json';
      link.click();
      window.URL.revokeObjectURL(url);
      this.message.success('网络导出成功');
    }
  }

  importNetwork(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            if (this.cy) {
              this.cy.json(data);
              this.updateNetworkStats();
              this.message.success('网络导入成功');
            }
          } catch (error) {
            this.message.error('导入网络失败：文件格式无效');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  toggleLabels(): void {
    if (this.cy) {
      this.cy.nodes().style('label', this.showLabels ? 'data(label)' : '');
    }
  }

  toggleEdgeLabels(): void {
    if (this.cy) {
      this.cy.edges().style('label', this.showEdgeLabels ? 'data(label)' : '');
    }
  }

  initializeCytoscape(data: any): void {
    data.elements.nodes.forEach((node: any) => {
      if (
        this.cy.nodes().filter((n: any) => n.data().id == node.data.id)
          .length == 0
      ) {
        this.cy.add(node);
      } else {
        if (this.cy.getElementById(node.data.id).data().base.length == 0) {
          this.cy.getElementById(node.data.id).data(node.data);
        }
      }
    });
    data.elements.edges.forEach((edge: any) => {
      if (
        this.cy
          .edges()
          .filter(
            (e: any) =>
              e.data().source == edge.data.source &&
              e.data().target == edge.data.target
          ).length == 0
      ) {
        this.cy.add(edge);
      }
    });
    this.cy.nodes().forEach((n: any) => {
      // const existingPopper = n.scratch('_popper');
      // if (existingPopper) {
      //   console.log(existingPopper)
      //   existingPopper.destroy();
      // }
      // let popper = n.popper({
      //   content: () => {
      //     let div = document.createElement('div');

      //     div.innerHTML = `<img width="50px" src="http://localhost:9000/kgms/${n.data().images[0]}" />${n.data()['base'].map((b: any) => '<p>' + b.label + ':' + b.value + '</p>')}`

      //     document.body.appendChild(div);

      //     return div;
      //   },
      //   popper: {
      //     placement: 'right',
      //     modifiers: {
      //       preventOverflow: {
      //         boundariesElement: document.body,
      //         padding: 10,
      //         priority: []
      //       },
      //       hide: {
      //         enabled: true
      //       }
      //     }

      //   }
      // });
      // n.scratch('_popper', popper)
      // let update = () => {
      //   popper.update();
      // };

      // n.on('position', update);

      // this.cy.on('pan zoom resize', update);
    });

    this.cy
      .layout({
        name: 'cola',
        animate: true,
      })
      .run();

    // Update network stats after initialization
    setTimeout(() => {
      this.updateNetworkStats();
    }, 100);
  }

  search(keyword: any) {
    let query = {};
    if (keyword != '') {
      if (this.way == '默认检索') {
        query = {
          must: [
            {
              match: {
                'labels.zh.value': {
                  query: keyword,
                  operator: 'and',
                },
              },
            },
          ],
        };
      } else if (this.way == '精确检索') {
        query = { should: [{ term: { 'labels.zh.value.keyword': keyword } }] };
      } else {
        query = { must: [{ match: { 'labels.zh.value': keyword } }] };
      }
    }
    this.esService.searchEntity(1, 10, { bool: query }).subscribe((data: any) => { });
  }
  modelAsync = signal('');
  dataAsync = signal(
    (str: string) =>
      new Observable<string[]>((x) => {
        // 替换成http请求
        let query = {};
        if (str != '') {
          if (this.way == '默认检索') {
            query = {
              must: [
                {
                  match: {
                    'labels.zh.value': {
                      query: str,
                      operator: 'and',
                    },
                  },
                },
              ],
            };
          } else if (this.way == '精确检索') {
            query = { should: [{ term: { 'labels.zh.value.keyword': str } }] };
          } else {
            query = { must: [{ match: { 'labels.zh.value': str } }] };
          }
        }
        this.esService.searchEntity(1, 10, { bool: query }).subscribe((data: any) => {
          x.next(data.list);
          x.complete();
        });
      })
  );

  selectNode(node: any) {
    this.modelAsync = signal(node?._source?.labels.zh.value);
    this.service.graph(1, 10, node?._id).subscribe((data: any) => {
      this.initializeCytoscape(data);
    });
  }

  ngOnDestroy(): void { }
}
