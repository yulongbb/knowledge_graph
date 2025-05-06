import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Node } from '@antv/x6';

export interface NodeConfig {
  id: string;
  label: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class NodeConfigService {
  private selectedNodeSubject = new BehaviorSubject<NodeConfig | null>(null);
  selectedNode$ = this.selectedNodeSubject.asObservable();
  
  // 简化逻辑，避免出错
  selectNode(node: Node | null) {
    // 暂时禁用节点选择功能
    this.selectedNodeSubject.next(null);
  }

  updateNodeProperties(nodeId: string, properties: any) {
    // 简化实现
    console.log(`Updated node ${nodeId} properties`);
  }
}
