import { XId } from '@ng-nest/ui/core';

export interface EtlProject extends XId {
  id: string;
  name: string;
  description: string;
  flow?: FlowData;
  createTime: string;
  updateTime: string;
}

export interface FlowData {
  nodes: Array<{
    id: string;
    type: string;
    properties?: any;
    position: { x: number; y: number };
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}
