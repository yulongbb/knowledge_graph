export interface EtlProject {
  id: string;
  name: string;
  description: string;
  createTime: string;
  updateTime: string;
  flow?: FlowData;
}

export interface FlowData {
  nodes: any[];
  edges: any[];
}
