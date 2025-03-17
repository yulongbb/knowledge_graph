import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Graph, Node, Shape } from '@antv/x6';
import { sourceNodeConfig, transformNodeConfig, targetNodeConfig } from '../models/node-shapes';
import { NodeConfigService } from '../services/node-config.service';
import { FlowService } from '../services/flow.service';

@Component({
  selector: 'app-etl-graph',
  template: `
    <div class="etl-container">
      <app-etl-toolbar
        (save)="saveFlow()"
        (load)="loadFlow()"
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
    </div>
  `,
  styles: [`
    .etl-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .workspace {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 250px;
      border-right: 1px solid #ddd;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .graph-container {
      flex: 1;
      min-height: 0;
      position: relative;
    }
    .etl-graph {
      width: 100%;
      height: 100%;
      min-height: 400px;
      border: 1px solid #ddd;
    }
  `]
})
export class EtlGraphComponent implements AfterViewInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  private graph!: Graph;

  constructor(
    private nodeConfigService: NodeConfigService,
    private flowService: FlowService
  ) {}

  ngAfterViewInit() {
    // 确保DOM已经加载完成
    if (this.containerRef?.nativeElement) {
      this.initGraph();
      this.setupDragAndDrop();
    }
  }

  async saveFlow() {
    const data = this.flowService.saveFlow(this.graph);
    localStorage.setItem('etl-flow', JSON.stringify(data));
  }

  async loadFlow() {
    const savedData = localStorage.getItem('etl-flow');
    if (savedData) {
      const data = JSON.parse(savedData);
      await this.flowService.loadFlow(this.graph, data);
    }
  }

  async executeFlow() {
    await this.flowService.executeFlow(this.graph);
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
