import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Graph, Node, Shape } from '@antv/x6';
import { ActivatedRoute, Router } from '@angular/router';
import { sourceNodeConfig, transformNodeConfig, targetNodeConfig } from '../models/node-shapes';
import { NodeConfigService } from '../services/node-config.service';
import { FlowService } from '../services/flow.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-etl-graph',
  template: `
    <div class="etl-container">
      <app-etl-toolbar
        (save)="saveFlow()"
        (execute)="executeFlow()">
      </app-etl-toolbar>
      <div class="workspace">
        <div class="sidebar">
          <app-etl-toolbox></app-etl-toolbox>
          <app-node-config-panel></app-node-config-panel>
        </div>
        <div class="main-content">
          <div class="graph-container">
            <div class="etl-graph" #container></div>
          </div>
          <app-data-preview></app-data-preview>
        </div>
      </div>
      <button class="btn btn-default back-button" (click)="goBack()">返回主页</button>
    </div>
  `,
  styleUrls: ['./etl-graph.component.scss']
})
export class EtlGraphComponent implements AfterViewInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  private graph!: Graph;
  private projectId!: string;

  constructor(
    private nodeConfigService: NodeConfigService,
    private flowService: FlowService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngAfterViewInit() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
      this.initGraph();
      this.setupDragAndDrop();
      this.loadFlow();
    });
  }

  async saveFlow() {
    const data = this.flowService.saveFlow(this.graph);
    this.projectService.saveFlow(this.projectId, data);
  }

  async loadFlow() {
    const flow = await this.projectService.loadFlow(this.projectId);
    if (flow) {
      await this.flowService.loadFlow(this.graph, flow);
    }
  }

  async executeFlow() {
    await this.flowService.executeFlow(this.graph);
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
        magnetConnectable: true
      },
      background: {
        color: '#ffffff'
      }
    });

    // Set graph in FlowService
    this.flowService.setGraph(this.graph);

    this.graph.on('cell:click', ({ cell }) => {
      if (cell instanceof Node) {
        this.nodeConfigService.selectNode(cell);
      }
    });

    this.graph.on('blank:click', () => {
      this.nodeConfigService.selectNode(null);
    });

    // 添加执行状态监听
    this.flowService.executingNode$.subscribe(nodeId => {
      this.graph.getNodes().forEach(node => {
        if (node.id === nodeId) {
          node.setAttrByPath('body/stroke', '#1890ff');
          node.setAttrByPath('body/strokeWidth', 3);
        } else {
          node.setAttrByPath('body/stroke', node.getData()?.executing ? '#52c41a' : '#ddd');
          node.setAttrByPath('body/strokeWidth', 2);
        }
      });
    });
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
}
