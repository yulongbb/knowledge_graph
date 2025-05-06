import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Graph, Node, Shape } from '@antv/x6';
import { ActivatedRoute, Router } from '@angular/router';
import { sourceNodeConfig, transformNodeConfig, targetNodeConfig } from '../models/node-shapes';
import { NodeConfigService } from '../services/node-config.service';
import { FlowService } from '../services/flow.service';
import { ProjectService } from '../services/project.service';
import { XMessageService } from '@ng-nest/ui/message';
import { XMessageBoxService } from '@ng-nest/ui/message-box';
import { EtlProject } from '../models/project.model';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-etl-graph',
  template: `
    <div class="etl-container">
      <div class="layout-header">
        <app-etl-toolbar
          [projectName]="project?.name"
          (save)="saveFlow()"
          (execute)="executeFlow()">
        </app-etl-toolbar>
      </div>
      
      <div class="layout-main">
        <div class="layout-sider">
          <x-tabs>
            <x-tab [label]="'组件库'">
              <app-etl-toolbox></app-etl-toolbox>
            </x-tab>
            <x-tab [label]="'节点配置'">
              <app-node-config-panel></app-node-config-panel>
            </x-tab>
          </x-tabs>
        </div>
        
        <div class="layout-content">
          <div class="graph-container">
            <div class="etl-graph" #container></div>
            
            <!-- 删除图表控制按钮 -->
          </div>
          <div class="preview-container">
            <app-data-preview></app-data-preview>
          </div>
        </div>
      </div>
      
      <div class="loading-container" *ngIf="loading">
        <div class="loading-content">
          <i class="fto-loader"></i>
          <span>正在加载...</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./etl-graph.component.scss']
})
export class EtlGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  public isGraphInitialized = false;
  private graph!: Graph;
  private projectId!: string;
  project?: EtlProject;
  loading = false;
  private subscriptions = new Subscription();

  constructor(
    private nodeConfigService: NodeConfigService,
    private flowService: FlowService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private message: XMessageService,
    private messageBox: XMessageBoxService
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        this.projectId = params.get('id')!;
        this.loadProject();
      })
    );
  }

  loadProject() {
    this.loading = true;
    this.subscriptions.add(
      this.projectService.get(this.projectId)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (project: EtlProject) => {
            this.project = project;
            if (this.graph) {
              this.loadFlow();
            }
          },
          error: (error: any) => {
            this.message.error(`加载项目失败: ${error.message || '未知错误'}`);
            this.router.navigate(['/etl']);
          }
        })
    );
  }

  ngAfterViewInit() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
      this.initGraph();
      this.setupDragAndDrop();
      this.loadFlow();
    });
  }

  ngOnDestroy() {
    // 确保在组件销毁前移除所有事件监听器
    if (this.graph) {
      try {
        this.graph.off();  // 移除所有事件监听器
      } catch(e) {
        console.warn('Error during graph cleanup', e);
      }
    }
    this.subscriptions.unsubscribe();
  }

  async saveFlow() {
    if (!this.graph || !this.projectId) return;

    this.loading = true;
    const data = this.flowService.saveFlow(this.graph);
    
    this.subscriptions.add(
      this.projectService.saveFlow(this.projectId, data)
        .pipe(
          finalize(() => this.loading = false)  // Fixed the syntax error - removed the opening brace
        )
        .subscribe({
          next: () => {
            this.message.success('流程已保存');
          },
          error: (error) => {
            this.message.error(`保存失败: ${error.message}`);
          }
        })
    );
  }

  async loadFlow() {
    if (!this.graph || !this.project || !this.project.flow) return;

    try {
      this.loading = true;
      await this.flowService.loadFlow(this.graph, this.project.flow);
      
      // 添加延时确保图表已完全渲染 (fixed typo in the comment)
      setTimeout(() => {
        this.fitContent();
        this.loading = false;
        this.message.success('流程已加载');
      }, 300);
    } catch (error: any) {
      this.loading = false;
      this.message.error(`加载失败: ${error.message}`);
    }
  }

  async executeFlow() {
    if (!this.graph) return;

    this.message.info('正在执行流程...');
    
    try {
      await this.flowService.executeFlow(this.graph);
      this.message.success('流程执行完成');
    } catch (error: any) {
      this.message.error(`执行失败: ${error.message}`);
    }
  }

  goBack() {
    this.router.navigate(['/etl']);
  }

  private initGraph() {
    const container = this.containerRef.nativeElement;

    if (!container) {
      console.error('Graph container not found');
      return;
    }

    // Create graph without the unsupported minimap config
    this.graph = new Graph({
      container,
      grid: {
        visible: true,
        type: 'mesh',
        size: 10,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        validateConnection: this.validateConnection.bind(this),
        connector: {
          name: 'smooth',
          args: {
            radius: 8
          }
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#5F95FF',
                strokeWidth: 1,
                targetMarker: {
                  name: 'classic',
                  size: 8
                }
              }
            }
          });
        }
      },
      interacting: {
        nodeMovable: true,
        edgeMovable: false,
        edgeLabelMovable: false,
        magnetConnectable: true,
      },
      background: {
        color: '#ffffff'
      },
     
      // 启用画布平移
      panning: {
        enabled: true,
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: 1.1,
        maxScale: 2,
        minScale: 0.5,
      },
    });

    // Set graph in FlowService
    this.flowService.setGraph(this.graph);
    this.isGraphInitialized = true;
    
    // 删除所有点击事件处理，以解决点击无反应的问题

    // 只保留执行状态监听，优化性能
    const subscription = this.flowService.executingNode$.subscribe(nodeId => {
      if (!this.graph || this.loading) return;
      
      try {
        this.graph.getNodes().forEach(node => {
          if (node.id === nodeId) {
            node.setAttrByPath('body/stroke', '#1890ff');
            node.setAttrByPath('body/strokeWidth', 3);
          } else {
            const isExecuting = node.getData()?.executing === true;
            node.setAttrByPath('body/stroke', isExecuting ? '#52c41a' : '#ddd');
            node.setAttrByPath('body/strokeWidth', 2);
          }
        });
      } catch (error) {
        console.error('Error updating node execution status', error);
      }
    });
    
    // 确保在组件销毁时取消订阅
    this.subscriptions.add(subscription);
  }

  private validateConnection({ sourceCell, targetCell }: any) {
    if (!sourceCell || !targetCell) return false;
    const sourceType = sourceCell.getData()?.type;
    const targetType = targetCell.getData()?.type;

    // 简单的连接规则
    if (sourceType === 'source' && targetType === 'transform') return true;
    if (sourceType === 'transform' && targetType === 'target') return true;
    if (sourceType === 'transform' && targetType === 'transform') return true;

    return false;
  }

  private setupDragAndDrop() {
    if (!this.containerRef?.nativeElement) return;
    const container = this.containerRef.nativeElement;

    container.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }

      // 添加拖拽悬停效果
      container.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
    });

    container.addEventListener('dragleave', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.style.backgroundColor = '';
    });

    container.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.style.backgroundColor = '';

      const nodeType = e.dataTransfer?.getData('node-type');
      if (!nodeType) return;

      const rect = container.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      this.createNode(nodeType, position);
    });
  }

  private createNode(type: string, position: { x: number; y: number }) {
    let nodeConfig;
    switch (type) {
      case 'source':
        nodeConfig = sourceNodeConfig;
        break;
      case 'transform':
        nodeConfig = transformNodeConfig;
        break;
      case 'target':
        nodeConfig = targetNodeConfig;
        break;
      default:
        return;
    }

    const node = this.graph.addNode({
      ...nodeConfig,
      position,
      data: { type, properties: {} }
    });
    return node;
  }

  // 重新实现缩放功能，修复无法使用的问题
  zoomIn() {
    console.log("Zoom in called");
    try {
      if (this.graph) {
        const currentScale = this.graph.zoom();
        console.log("Current zoom level:", currentScale);
        const newScale = Math.min(2, currentScale + 0.2);
        this.graph.zoom(newScale);
        console.log("New zoom level set to:", newScale);
      }
    } catch (error) {
      console.error("Error during zoom in:", error);
    }
  }

  zoomOut() {
    console.log("Zoom out called");
    try {
      if (this.graph) {
        const currentScale = this.graph.zoom();
        console.log("Current zoom level:", currentScale);
        const newScale = Math.max(0.3, currentScale - 0.2);
        this.graph.zoom(newScale);
        console.log("New zoom level set to:", newScale);
      }
    } catch (error) {
      console.error("Error during zoom out:", error);
    }
  }

  fitContent() {
    console.log("Fit content called");
    try {
      if (this.graph) {
        this.graph.zoomToFit({ padding: 40, maxScale: 1.5 });
        console.log("Content fitted to view");
      }
    } catch (error) {
      console.error("Error during fit content:", error);
    }
  }

  centerContent() {
    console.log("Center content called");
    try {
      if (this.graph) {
        this.graph.centerContent();
        console.log("Content centered");
      }
    } catch (error) {
      console.error("Error during center content:", error);
    }
  }
}
