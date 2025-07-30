import { Component, AfterViewInit } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';

interface PaletteItem {
  type?: string;
  label: string;
  icon?: string;
}

interface CanvasItem {
  id: number;
  type: 'text' | 'image' | 'chart' | 'button' | 'echart';
  x: number;
  y: number;
  content?: string;
  src?: string;
  echartType?: string; // 仅 'echart' 类型使用
}

interface CanvasState {
  id: number;
  name: string;
  items: CanvasItem[];
  offset: { x: number; y: number };
  scale: number;
}

@Component({
  selector: 'app-visualization-dashboard',
  templateUrl: './visualization-dashboard.component.html',
  styleUrls: ['./visualization-dashboard.component.scss']
})
export class VisualizationDashboardComponent implements AfterViewInit {
  // 菜单定义
  paletteMenus = [
    { type: 'chart', label: '图表', icon: '📊' },
    { type: 'material', label: '素材', icon: '🖼️' },
    { type: 'resource', label: '资源', icon: '📦' },
    { type: 'template', label: '模版', icon: '📄' }
  ];

  activeMenu: string = 'chart';

  // 画布状态
  canvases: CanvasState[] = [];
  activeCanvasId: number = 1;
  nextCanvasId = 1;
  editingCanvasId: number | null = null;

  selectedItem: CanvasItem | null = null;
  nextId = 1;
  isDragOver = false;

  // 右侧边栏状态
  isDataPanelOpen = true;
  isStylePanelOpen = false;

  // 画布拖拽状态
  isDraggingCanvas = false;
  dragStartPos = { x: 0, y: 0 };

  // 应用 ID
  applicationId: string | null = null;

  constructor(private route: ActivatedRoute) {
    console.log('VisualizationDashboardComponent constructor called');
    this.addCanvas();
    console.log('Initial canvas added:', this.canvases);

    // 通过 ActivatedRoute 获取应用 id
    this.route.paramMap.subscribe(params => {
      this.applicationId = params.get('id');
      if (this.applicationId) {
        console.log('当前应用ID:', this.applicationId);
        // 可在此处根据应用ID加载相关数据
      }
    });
  }

  // 获取当前激活的画布
  get activeCanvas(): CanvasState | undefined {
    return this.canvases.find(c => c.id === this.activeCanvasId);
  }

  // 获取当前画布的组件列表
  get canvasItems(): CanvasItem[] {
    return this.activeCanvas?.items || [];
  }

  // 获取当前画布的偏移量
  get canvasOffset() {
    return this.activeCanvas?.offset || { x: 0, y: 0 };
  }

  set canvasOffset(value: { x: number; y: number }) {
    if (this.activeCanvas) {
      this.activeCanvas.offset = value;
    }
  }

  // 获取当前画布的缩放比例
  get canvasScale() {
    return this.activeCanvas?.scale || 1;
  }

  set canvasScale(value: number) {
    if (this.activeCanvas) {
      this.activeCanvas.scale = value;
    }
  }

  // trackBy函数
  trackByFn(index: number, item: CanvasItem): number {
    return item.id;
  }

  // 进入条件检查函数 - 只允许从组件库拖入（复制拖拽）
  enterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    // 允许 palette（组件库）中的组件（无id）拖入画布，支持 echart 类型
    return drag.data && drag.data.type && !drag.data.id;
  };

  // 从组件库拖拽到画布时触发（复制拖拽）
  onDrop(event: CdkDragDrop<any>) {
    this.isDragOver = false;
    // 只允许 palette（组件库）中的组件（无id）拖入画布，进行复制
    if (!event.item.data || !event.item.data.type || event.item.data.id || !this.activeCanvas) {
      return;
    }

    const type = event.item.data.type;
    const extra = event.item.data;
    const canvasEl = event.container.element.nativeElement as HTMLElement;
    const canvasRect = canvasEl.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if (event.event instanceof MouseEvent) {
      clientX = event.event.clientX;
      clientY = event.event.clientY;
    } else if (event.event instanceof TouchEvent) {
      clientX = event.event.touches[0].clientX;
      clientY = event.event.touches[0].clientY;
    } else {
      clientX = canvasRect.left + canvasRect.width / 2;
      clientY = canvasRect.top + canvasRect.height / 2;
    }

    const xInCanvas = clientX - canvasRect.left;
    const yInCanvas = clientY - canvasRect.top;
    const x = xInCanvas / this.canvasScale;
    const y = yInCanvas / this.canvasScale;

    // 复制一个新组件到画布
    const item = this.createItem(type, x - 50, y - 20, extra);
    this.activeCanvas.items.push(item);
    this.selectItem(item);
  }

  // 创建组件
  createItem(type: string, x: number, y: number, extra?: any): CanvasItem {
    const baseItem = {
      id: this.nextId++,
      x, y
    };

    // 支持 echart 类型
    if (['bar', 'line', 'pie', 'scatter', 'radar'].includes(type)) {
      return { ...baseItem, type: 'echart', echartType: type };
    }

    switch (type) {
      case 'text':
        return { ...baseItem, type: 'text', content: '双击编辑文本' };
      case 'image':
        return { ...baseItem, type: 'image', src: 'https://via.placeholder.com/200x150?text=图片' };
      case 'chart':
        return { ...baseItem, type: 'chart' };
      case 'button':
        return { ...baseItem, type: 'button', content: '按钮' };
      default:
        return { ...baseItem, type: 'text', content: '未知组件' };
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    requestAnimationFrame(() => {
      this.initializeCanvas();
    });
  }

  // 初始化画布位置和缩放
  initializeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper') as HTMLElement;
    if (wrapper && this.activeCanvas) {
      wrapper.offsetHeight;

      const wrapperWidth = wrapper.offsetWidth;
      const wrapperHeight = wrapper.offsetHeight;

      this.canvasScale = (wrapperWidth - 60) / 1920;
      this.canvasOffset = {
        x: (wrapperWidth - 1920 * this.canvasScale) / 2,
        y: (wrapperHeight - 1080 * this.canvasScale) / 2
      };
    }
  }

  // 画布拖拽开始
  onCanvasMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget && this.activeCanvas) {
      this.isDraggingCanvas = true;
      this.dragStartPos = {
        x: event.clientX - this.canvasOffset.x,
        y: event.clientY - this.canvasOffset.y
      };
      event.preventDefault();
    }
  }

  // 画布拖拽中
  onCanvasMouseMove(event: MouseEvent) {
    if (this.isDraggingCanvas && this.activeCanvas) {
      this.canvasOffset = {
        x: event.clientX - this.dragStartPos.x,
        y: event.clientY - this.dragStartPos.y
      };
      event.preventDefault();
    }
  }

  // 画布拖拽结束
  onCanvasMouseUp(event: MouseEvent) {
    this.isDraggingCanvas = false;
  }

  // 获取画布样式
  getCanvasStyle() {
    if (!this.activeCanvas) return {};
    return {
      transform: `translate(${this.canvasOffset.x}px, ${this.canvasOffset.y}px) scale(${this.canvasScale})`,
      cursor: this.isDraggingCanvas ? 'grabbing' : 'grab'
    };
  }

  // 画布滚轮缩放
  onCanvasWheel(event: WheelEvent) {
    event.preventDefault();
    if (!this.activeCanvas) return;

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(3, this.canvasScale + delta));

    if (newScale !== this.canvasScale) {
      this.canvasScale = newScale;
    }
  }

  // 放大
  zoomIn() {
    if (!this.activeCanvas) return;
    this.canvasScale = Math.min(3, this.canvasScale + 0.1);
  }

  // 缩小
  zoomOut() {
    if (!this.activeCanvas) return;
    this.canvasScale = Math.max(0.1, this.canvasScale - 0.1);
  }

  // 重置画布
  resetCanvas() {
    this.initializeCanvas();
  }

  // 适应容器宽度
  fitToContainerWidth() {
    this.initializeCanvas();
  }

  // 适应屏幕
  fitToScreen() {
    const wrapper = document.querySelector('.canvas-wrapper') as HTMLElement;
    if (wrapper && this.activeCanvas) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const scaleX = (wrapperRect.width - 40) / 1920;
      const scaleY = (wrapperRect.height - 40) / 1080;
      this.canvasScale = Math.min(scaleX, scaleY);

      const canvasWidth = 1920 * this.canvasScale;
      const canvasHeight = 1080 * this.canvasScale;
      this.canvasOffset = {
        x: (wrapperRect.width - canvasWidth) / 2,
        y: (wrapperRect.height - canvasHeight) / 2
      };
    }
  }

  // 画布内拖动结束（移动现有组件）
  onItemDragEnd(event: CdkDragEnd, item: CanvasItem) {
    const el = event.source.element.nativeElement as HTMLElement;
    const transform = el.style.transform;

    if (transform) {
      const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(transform);
      if (match) {
        const dx = parseFloat(match[1]);
        const dy = parseFloat(match[2]);

        // 移除边界限制，允许组件在画布任意位置
        item.x += dx;
        item.y += dy;

        el.style.transform = '';
      }
    }
  }

  // 选择组件
  selectItem(item: CanvasItem) {
    this.selectedItem = item;
  }

  // 复制组件
  copyItem(item: CanvasItem) {
    if (!this.activeCanvas) return;
    const newItem = {
      ...item,
      id: this.nextId++,
      x: item.x + 20,
      y: item.y + 20
    };
    this.activeCanvas.items.push(newItem);
    this.selectItem(newItem);
  }

  // 删除组件
  removeItem(item: CanvasItem) {
    if (!this.activeCanvas) return;
    const index = this.activeCanvas.items.indexOf(item);
    if (index > -1) {
      this.activeCanvas.items.splice(index, 1);
      if (this.selectedItem === item) {
        this.selectedItem = null;
      }
    }
  }

  // 更新内容
  updateContent(item: CanvasItem, event: any) {
    item.content = event.target.textContent;
  }

  // 清空画布
  clearCanvas() {
    if (this.activeCanvas) {
      this.activeCanvas.items = [];
      this.selectedItem = null;
    }
  }

  // 预览模式
  previewMode() {
    console.log('预览模式');
  }

  // 保存设计
  saveDesign() {
    console.log('保存设计', this.activeCanvas?.items);
  }

  // 切换菜单
  switchMenu(type: string) {
    this.activeMenu = type;
  }

  // 获取当前菜单标签
  getCurrentMenuLabel(): string {
    const menu = this.paletteMenus.find(m => m.type === this.activeMenu);
    const label = menu ? menu.label : '组件库';
    console.log('Current menu label:', label);
    return label;
  }

  // 拖拽悬停
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  // 拖拽离开
  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  // 切换样式面板
  toggleStylePanel() {
    this.isStylePanelOpen = !this.isStylePanelOpen;
  }

  // 获取缩放百分比
  getZoomPercent(): number {
    return Math.round(this.canvasScale * 100);
  }

  // 添加新画布
  addCanvas() {
    const newCanvas: CanvasState = {
      id: this.nextCanvasId,
      name: `画布${this.nextCanvasId}`,
      items: [],
      offset: { x: 0, y: 0 },
      scale: 1
    };
    this.canvases.push(newCanvas);
    this.switchCanvas(newCanvas.id);
    this.nextCanvasId++;
  }

  // 切换画布
  switchCanvas(id: number) {
    this.activeCanvasId = id;
    this.selectedItem = null; // 切换画布时清除选中状态
    requestAnimationFrame(() => {
      this.initializeCanvas();
    });
  }

  // 开始重命名画布
  startRenaming(id: number, event: Event) {
    event.stopPropagation();
    this.editingCanvasId = id;
  }

  // 保存画布名称
  saveCanvasName(id: number, name: string) {
    const canvas = this.canvases.find(c => c.id === id);
    if (canvas && name.trim()) {
      canvas.name = name.trim();
    }
    this.editingCanvasId = null;
  }

  // 取消重命名
  cancelRenaming() {
    this.editingCanvasId = null;
  }

  // 删除画布
  deleteCanvas(id: number, event: Event) {
    event.stopPropagation();
    if (this.canvases.length <= 1) {
      return; // 至少保留一个画布
    }

    const index = this.canvases.findIndex(c => c.id === id);
    if (index > -1) {
      this.canvases.splice(index, 1);

      // 如果删除的是当前画布，切换到第一个画布
      if (id === this.activeCanvasId) {
        this.switchCanvas(this.canvases[0].id);
      }
    }
  }

  // 处理输入框按键事件
  onCanvasNameKeydown(event: KeyboardEvent, id: number) {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      this.saveCanvasName(id, target.value);
    } else if (event.key === 'Escape') {
      this.cancelRenaming();
    }
  }

  // 处理样式面板中的组件更新
  onItemUpdated(item: CanvasItem) {
    // 组件已经通过引用更新，这里可以添加额外的逻辑
    console.log('Item updated:', item);
  }

  // 处理样式面板中的复制操作
  onItemCopied(item: CanvasItem) {
    this.copyItem(item);
  }

  // 处理样式面板中的删除操作
  onItemDeleted(item: CanvasItem) {
    this.removeItem(item);
  }

  getEchartOptions(type: string): any {
    switch (type) {
      case 'bar':
        return {
          xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'] },
          yAxis: { type: 'value' },
          series: [{ data: [23, 45, 12, 36], type: 'bar' }]
        };
      case 'line':
        return {
          xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'] },
          yAxis: { type: 'value' },
          series: [{ data: [12, 34, 22, 18], type: 'line' }]
        };
      case 'pie':
        return {
          series: [{
            type: 'pie',
            data: [
              { value: 40, name: 'A' },
              { value: 30, name: 'B' },
              { value: 20, name: 'C' },
              { value: 10, name: 'D' }
            ]
          }]
        };
      case 'scatter':
        return {
          xAxis: {},
          yAxis: {},
          series: [{
            symbolSize: 20,
            data: [[10, 20], [20, 30], [30, 10], [40, 50]],
            type: 'scatter'
          }]
        };
      case 'radar':
        return {
          radar: {
            indicator: [
              { name: 'A', max: 100 },
              { name: 'B', max: 100 },
              { name: 'C', max: 100 }
            ]
          },
          series: [{
            type: 'radar',
            data: [
              { value: [60, 80, 70], name: '示例' }
            ]
          }]
        };
      default:
        return {};
    }
  }

  onPaletteItemSelected(item: PaletteItem) {
    if (!this.activeCanvas || !item.type) return;
    // 居中显示
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    const x = canvasWidth / 2 - 50;
    const y = canvasHeight / 2 - 20;
    // 复用 createItem 逻辑
    const newItem = this.createItem(item.type, x, y, item);
    this.activeCanvas.items.push(newItem);
    this.selectItem(newItem);
  }
}