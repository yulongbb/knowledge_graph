import { Component } from '@angular/core';

@Component({
  selector: 'app-etl-toolbox',
  template: `
    <div class="etl-toolbox">
      <h3>组件工具箱</h3>
      <div class="node-list">
        <div class="node-item source" draggable="true" (dragstart)="onDragStart($event, 'source')">
          <i class="node-icon">📥</i>
          <span class="node-label">数据源</span>
          <span class="node-desc">导入CSV、数据库等</span>
        </div>
        <div class="node-item transform" draggable="true" (dragstart)="onDragStart($event, 'transform')">
          <i class="node-icon">⚡</i>
          <span class="node-label">转换</span>
          <span class="node-desc">数据处理转换</span>
        </div>
        <div class="node-item target" draggable="true" (dragstart)="onDragStart($event, 'target')">
          <i class="node-icon">📤</i>
          <span class="node-label">目标</span>
          <span class="node-desc">输出到目标位置</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .etl-toolbox {
      padding: 16px;
      background: #fff;
      height: 100%;
    }
    h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }
    .node-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .node-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border: 2px solid transparent;
      border-radius: 6px;
      cursor: move;
      transition: all 0.2s;
      background: #f8f9fa;
    }
    .node-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .node-item.source {
      border-color: #1890ff;
    }
    .node-item.transform {
      border-color: #ffa940;
    }
    .node-item.target {
      border-color: #52c41a;
    }
    .node-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .node-label {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .node-desc {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .source:hover { background: #e6f7ff; }
    .transform:hover { background: #fff7e6; }
    .target:hover { background: #f6ffed; }
  `]
})
export class EtlToolboxComponent {
  onDragStart(event: DragEvent, nodeType: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('node-type', nodeType);
      event.dataTransfer.effectAllowed = 'copy';
      
      // 创建拖拽图像
      const dragImage = document.createElement('div');
      dragImage.className = `node-item ${nodeType}`;
      dragImage.style.width = '100px';
      dragImage.style.height = '40px';
      dragImage.style.backgroundColor = nodeType === 'source' ? '#e6f7ff' 
        : nodeType === 'transform' ? '#fff7e6' 
        : '#f6ffed';
      document.body.appendChild(dragImage);
      
      event.dataTransfer.setDragImage(dragImage, 50, 20);
      
      // 清理临时元素
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }
}
