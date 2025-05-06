import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Node } from '@antv/x6';

export interface NodeConfig {
  id: string;
  type: string;
  properties: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class NodeConfigService {
  private selectedNode = new BehaviorSubject<NodeConfig | null>(null);
  selectedNode$: Observable<NodeConfig | null> = this.selectedNode.asObservable();

  selectNode(node: Node | null) {
    if (!node) {
      this.selectedNode.next(null);
      return;
    }

    const config: NodeConfig = {
      id: node.id,
      type: node.getData()?.type || 'unknown',
      properties: node.getData()?.properties || {}
    };
    this.selectedNode.next(config);
  }

  updateNodeProperties(id: string, properties: Record<string, any>) {
    const current = this.selectedNode.value;
    if (current && current.id === id) {
      this.selectedNode.next({
        ...current,
        properties
      });
    }
  }
}
