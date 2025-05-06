import { Component } from '@angular/core';

@Component({
  selector: 'app-etl-toolbox',
  template: `
    <div class="etl-toolbox">
      <div class="toolbox-header">
        <h3>拖拽组件到画布</h3>
      </div>
      
      <x-card class="node-item source" draggable="true" (dragstart)="onDragStart($event, 'source')">
        <div class="card-body">
          <div class="node-content">
            <i class="node-icon">📥</i>
            <span class="node-label">数据源</span>
            <span class="node-desc">导入CSV、数据库等</span>
          </div>
        </div>
      </x-card>
      
      <x-card class="node-item transform" draggable="true" (dragstart)="onDragStart($event, 'transform')">
        <div class="card-body">
          <div class="node-content">
            <i class="node-icon">⚡</i>
            <span class="node-label">转换</span>
            <span class="node-desc">数据处理转换</span>
          </div>
        </div>
      </x-card>
      
      <x-card class="node-item target" draggable="true" (dragstart)="onDragStart($event, 'target')">
        <div class="card-body">
          <div class="node-content">
            <i class="node-icon">📤</i>
            <span class="node-label">目标</span>
            <span class="node-desc">输出到目标位置</span>
          </div>
        </div>
      </x-card>
    </div>
  `,
  styles: [`
    .etl-toolbox {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }
    
    .toolbox-header {
      margin-bottom: 8px;
    }
    
    .toolbox-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #595959;
    }
    
    .node-item {
      cursor: move;
      transition: all 0.25s ease;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .node-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    }
    
    .node-item:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .card-body {
      padding: 16px;
    }
    
    .node-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .node-icon {
      font-size: 28px;
      margin-bottom: 12px;
    }
    
    .node-label {
      font-weight: 500;
      margin-bottom: 6px;
      font-size: 16px;
    }
    
    .node-desc {
      font-size: 12px;
      color: #666;
    }
    
    .source {
      border-color: #1890ff;
      background: #e6f7ff;
    }
    
    .transform {
      border-color: #ffa940;
      background: #fff7e6;
    }
    
    .target {
      border-color: #52c41a;
      background: #f6ffed;
    }
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
