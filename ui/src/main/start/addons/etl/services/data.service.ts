import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NodeData {
  nodeId: string;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private nodeDataMap = new Map<string, any[]>();
  private previewData = new BehaviorSubject<NodeData | null>(null);
  previewData$ = this.previewData.asObservable();

  async fetchSourceData(url: string): Promise<any[]> {
    // 模拟从 URL 获取数据
    const mockData = [
      { id: 1, name: '测试1', value: 100 },
      { id: 2, name: '测试2', value: 200 },
      { id: 3, name: '测试3', value: 300 }
    ];
    return mockData;
  }

  setNodeData(nodeId: string, data: any[]) {
    this.nodeDataMap.set(nodeId, data);
    this.previewData.next({ nodeId, data });
  }

  getNodeData(nodeId: string): any[] {
    return this.nodeDataMap.get(nodeId) || [];
  }

  transformData(data: any[], expression: string): any[] {
    try {
      // 创建安全的转换上下文
      const context = {
        data,
        // 添加一些辅助函数
        helpers: {
          sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
          average: (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length,
          distinct: (arr: any[]) => [...new Set(arr)],
          groupBy: (arr: any[], key: string) => {
            return arr.reduce((group, item) => {
              const val = item[key];
              group[val] = group[val] || [];
              group[val].push(item);
              return group;
            }, {});
          }
        }
      };

      const transformFn = new Function('context', `
        with (context) {
          try {
            return ${expression};
          } catch (error) {
            console.error('Transform error:', error);
            return [];
          }
        }
      `);

      const result = transformFn(context);
      
      // 验证结果是否为数组
      if (!Array.isArray(result)) {
        throw new Error('转换结果必须是数组');
      }

      return result;
    } catch (error:any) {
      console.error('Transform error:', error);
      throw new Error(`转换失败: ${error.message}`);
    }
  }

  // 添加获取转换示例的方法
  getTransformExamples(): { name: string; code: string; description: string }[] {
    return [
      {
        name: '简单映射',
        code: 'data.map(item => ({ name: item.name, value: item.value * 2 }))',
        description: '将每个值翻倍'
      },
      {
        name: '过滤数据',
        code: 'data.filter(item => item.value > 100)',
        description: '只保留值大于100的项'
      },
      {
        name: '数据聚合',
        code: 'Object.values(helpers.groupBy(data, "category")).map(group => ({ category: group[0].category, total: helpers.sum(group.map(item => item.value)) }))',
        description: '按类别分组并计算总和'
      },
      {
        name: '数据去重',
        code: 'helpers.distinct(data.map(item => item.name))',
        description: '获取不重复的名称列表'
      }
    ];
  }
}
