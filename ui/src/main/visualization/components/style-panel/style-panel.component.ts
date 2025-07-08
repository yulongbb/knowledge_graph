import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

interface CanvasItem {
  id: number;
  type: 'text' | 'image' | 'chart' | 'button';
  x: number;
  y: number;
  content?: string;
  src?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  borderRadius?: number;
  opacity?: number;
}

@Component({
  selector: 'app-style-panel',
  template: `
    <div class="style-panel">
      <div class="style-config" *ngIf="selectedItem">
        <!-- 基础属性 -->
        <div class="style-section">
          <h4 class="section-title">位置和尺寸</h4>
          <div class="style-group">
            <div class="style-label">位置</div>
            <div class="style-inputs">
              <input 
                type="number" 
                [value]="selectedItem.x" 
                (input)="updateProperty('x', $event)"
                placeholder="X" 
                class="style-input"
              >
              <input 
                type="number" 
                [value]="selectedItem.y" 
                (input)="updateProperty('y', $event)"
                placeholder="Y" 
                class="style-input"
              >
            </div>
          </div>
          
          <div class="style-group">
            <div class="style-label">尺寸</div>
            <div class="style-inputs">
              <input 
                type="number" 
                [value]="selectedItem.width || 100" 
                (input)="updateProperty('width', $event)"
                placeholder="宽度" 
                class="style-input"
              >
              <input 
                type="number" 
                [value]="selectedItem.height || 50" 
                (input)="updateProperty('height', $event)"
                placeholder="高度" 
                class="style-input"
              >
            </div>
          </div>
        </div>

        <!-- 文本样式 -->
        <div class="style-section" *ngIf="selectedItem.type === 'text' || selectedItem.type === 'button'">
          <h4 class="section-title">文本样式</h4>
          <div class="style-group">
            <div class="style-label">内容</div>
            <textarea 
              [value]="selectedItem.content || ''" 
              (input)="updateProperty('content', $event)"
              class="style-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="style-group">
            <div class="style-label">字体大小</div>
            <input 
              type="number" 
              [value]="selectedItem.fontSize || 14" 
              (input)="updateProperty('fontSize', $event)"
              class="style-input"
              min="8"
              max="72"
            >
          </div>
          
          <div class="style-group">
            <div class="style-label">字体粗细</div>
            <select 
              [value]="selectedItem.fontWeight || 'normal'" 
              (change)="updateProperty('fontWeight', $event)"
              class="style-select"
            >
              <option value="normal">正常</option>
              <option value="bold">粗体</option>
              <option value="lighter">细体</option>
            </select>
          </div>
          
          <div class="style-group">
            <div class="style-label">文字颜色</div>
            <input 
              type="color" 
              [value]="selectedItem.color || '#000000'" 
              (input)="updateProperty('color', $event)"
              class="style-color"
            >
          </div>
        </div>

        <!-- 图片样式 -->
        <div class="style-section" *ngIf="selectedItem.type === 'image'">
          <h4 class="section-title">图片属性</h4>
          <div class="style-group">
            <div class="style-label">图片地址</div>
            <input 
              type="url" 
              [value]="selectedItem.src || ''" 
              (input)="updateProperty('src', $event)"
              class="style-input"
              placeholder="请输入图片URL"
            >
          </div>
        </div>

        <!-- 外观样式 -->
        <div class="style-section">
          <h4 class="section-title">外观</h4>
          <div class="style-group">
            <div class="style-label">背景颜色</div>
            <input 
              type="color" 
              [value]="selectedItem.backgroundColor || '#ffffff'" 
              (input)="updateProperty('backgroundColor', $event)"
              class="style-color"
            >
          </div>
          
          <div class="style-group">
            <div class="style-label">圆角</div>
            <input 
              type="number" 
              [value]="selectedItem.borderRadius || 0" 
              (input)="updateProperty('borderRadius', $event)"
              class="style-input"
              min="0"
              max="50"
            >
          </div>
          
          <div class="style-group">
            <div class="style-label">透明度</div>
            <input 
              type="range" 
              [value]="(selectedItem.opacity || 1) * 100" 
              (input)="updateOpacity($event)"
              class="style-range"
              min="0"
              max="100"
            >
            <span class="range-value">{{ Math.round((selectedItem.opacity || 1) * 100) }}%</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="style-section">
          <h4 class="section-title">操作</h4>
          <div class="action-buttons">
            <button class="action-btn copy" (click)="copyItem()">复制</button>
            <button class="action-btn delete" (click)="deleteItem()">删除</button>
            <button class="action-btn reset" (click)="resetStyles()">重置样式</button>
          </div>
        </div>
      </div>
      
      <div class="no-selection" *ngIf="!selectedItem">
        <div class="no-selection-icon">🎨</div>
        <div class="no-selection-text">请选择一个组件</div>
        <div class="no-selection-hint">点击画布上的组件来编辑其样式</div>
      </div>
    </div>
  `,
  styleUrls: ['./style-panel.component.scss']
})
export class StylePanelComponent implements OnChanges {
  @Input() selectedItem: CanvasItem | null = null;
  @Output() itemUpdated = new EventEmitter<CanvasItem>();
  @Output() itemCopied = new EventEmitter<CanvasItem>();
  @Output() itemDeleted = new EventEmitter<CanvasItem>();

  // 便于模板访问
  Math = Math;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedItem'] && this.selectedItem) {
      // 当选中新组件时，可以在这里初始化默认样式
      this.initializeDefaults();
    }
  }

  private initializeDefaults() {
    if (!this.selectedItem) return;

    // 为新组件设置默认样式
    if (this.selectedItem.width === undefined) this.selectedItem.width = 100;
    if (this.selectedItem.height === undefined) this.selectedItem.height = 50;
    if (this.selectedItem.backgroundColor === undefined) this.selectedItem.backgroundColor = '#ffffff';
    if (this.selectedItem.color === undefined) this.selectedItem.color = '#000000';
    if (this.selectedItem.fontSize === undefined) this.selectedItem.fontSize = 14;
    if (this.selectedItem.fontWeight === undefined) this.selectedItem.fontWeight = 'normal';
    if (this.selectedItem.borderRadius === undefined) this.selectedItem.borderRadius = 0;
    if (this.selectedItem.opacity === undefined) this.selectedItem.opacity = 1;
  }

  updateProperty(property: keyof CanvasItem, event: Event) {
    if (!this.selectedItem) return;
    
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any = target.value;

    // 根据属性类型转换值
    if (['x', 'y', 'width', 'height', 'fontSize', 'borderRadius'].includes(property)) {
      value = parseFloat(value) || 0;
    }

    (this.selectedItem as any)[property] = value;
    this.itemUpdated.emit(this.selectedItem);
  }

  updateOpacity(event: Event) {
    if (!this.selectedItem) return;
    
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value) / 100;
    this.selectedItem.opacity = value;
    this.itemUpdated.emit(this.selectedItem);
  }

  copyItem() {
    if (this.selectedItem) {
      this.itemCopied.emit(this.selectedItem);
    }
  }

  deleteItem() {
    if (this.selectedItem) {
      this.itemDeleted.emit(this.selectedItem);
    }
  }

  resetStyles() {
    if (!this.selectedItem) return;

    // 重置样式到默认值
    this.selectedItem.backgroundColor = '#ffffff';
    this.selectedItem.color = '#000000';
    this.selectedItem.fontSize = 14;
    this.selectedItem.fontWeight = 'normal';
    this.selectedItem.borderRadius = 0;
    this.selectedItem.opacity = 1;

    this.itemUpdated.emit(this.selectedItem);
  }
}
