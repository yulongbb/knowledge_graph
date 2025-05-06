import { Injectable } from '@angular/core';
import { Graph, Node, Edge } from '@antv/x6';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';
import { sourceNodeConfig, transformNodeConfig, targetNodeConfig } from '../models/node-shapes';

export interface FlowData {
  nodes: any[];
  edges: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  private executingNode = new BehaviorSubject<string | null>(null);
  executingNode$ = this.executingNode.asObservable();
  private graph: Graph | null = null;  // Add graph property

  constructor(private dataService: DataService) {}

  setGraph(graph: Graph) {  // Add method to set graph
    this.graph = graph;
  }

  saveFlow(graph: Graph): FlowData {
    return {
      nodes: graph.getNodes().map(node => ({
        id: node.id,
        type: node.getData()?.type,
        properties: node.getData()?.properties,
        position: node.getPosition(),
      })),
      edges: graph.getEdges().map(edge => ({
        source: edge.getSourceCellId(),
        target: edge.getTargetCellId(),
      }))
    };
  }

  async loadFlow(graph: Graph, data: FlowData) {
    graph.clearCells();
    
    // 加载节点
    data.nodes.forEach(nodeData => {
      let nodeConfig;
      switch (nodeData.type) {
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

      const node = graph.addNode({
        ...nodeConfig,
        id: nodeData.id,
        position: nodeData.position,
        data: {
          type: nodeData.type,
          properties: nodeData.properties
        }
      });
    });

    // 加载边
    data.edges.forEach(edgeData => {
      graph.addEdge({
        source: edgeData.source,
        target: edgeData.target,
        attrs: {
          line: {
            stroke: '#5F95FF',
            strokeWidth: 1,
            targetMarker: {
              name: 'classic',
              size: 8
            }
          }
        },
        connector: {
          name: 'smooth',
          args: {
            radius: 8
          }
        }
      });
    });
  }

  async executeFlow(graph: Graph) {
    const nodes = this.sortNodes(graph);
    
    for (const node of nodes) {
      this.executingNode.next(node.id);
      await this.executeNode(node);
    }
    
    this.executingNode.next(null);
  }

  private sortNodes(graph: Graph): Node[] {
    const visited = new Set<string>();
    const result: Node[] = [];

    const visit = (node: Node) => {
      if (visited.has(node.id)) return;
      
      const incomingEdges = graph.getIncomingEdges(node);
      if (incomingEdges) {
        incomingEdges.forEach(edge => {
          const sourceNode = edge.getSourceNode();
          if (sourceNode) visit(sourceNode);
        });
      }

      visited.add(node.id);
      result.push(node);
    };

    graph.getNodes().forEach(node => visit(node));
    return result;
  }

  private async executeNode(node: Node): Promise<void> {
    const type = node.getData()?.type;
    const properties = node.getData()?.properties || {};

    try {
      switch (type) {
        case 'source': {
          const data = await this.dataService.fetchSourceData(properties.url);
          this.dataService.setNodeData(node.id, data);
          break;
        }
        case 'transform': {
          if (!this.graph) return;
          const incomingEdges = this.graph.getIncomingEdges(node);
          if (!incomingEdges?.length) return;
          
          const sourceNode = incomingEdges[0].getSourceNode();
          if (!sourceNode) return;
          
          const inputData = this.dataService.getNodeData(sourceNode.id);
          const transformedData = this.dataService.transformData(
            inputData,
            properties.expression || 'data'
          );
          this.dataService.setNodeData(node.id, transformedData);
          break;
        }
        case 'target': {
          if (!this.graph) return;
          const incomingEdges = this.graph.getIncomingEdges(node);
          if (!incomingEdges?.length) return;
          
          const sourceNode = incomingEdges[0].getSourceNode();
          if (!sourceNode) return;
          
          const finalData = this.dataService.getNodeData(sourceNode.id);
          console.log('Target output:', finalData);
          break;
        }
      }
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
    }
  }
}
