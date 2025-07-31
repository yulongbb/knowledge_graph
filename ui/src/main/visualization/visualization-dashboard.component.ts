import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import Konva from 'konva';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/main/application/application.sevice'; // 确保路径正确
import { CanvasPreviewComponent } from './canvas-preview.component';

@Component({
  selector: 'app-visualization-dashboard',
  templateUrl: './visualization-dashboard.component.html',
  styleUrls: ['./visualization-dashboard.component.scss']
})
export class VisualizationDashboardComponent implements OnInit {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  stage!: Konva.Stage;
  layers: Konva.Layer[] = [];
  transformer!: Konva.Transformer;
  activeLayerIndex = 0;

  canvasWidth = 1920;
  canvasHeight = 1080;

  canvasElements: any[] = [];

  draggingType: string | null = null;
  selectedNode: Konva.Node | null = null;

  activeSidebar: string = 'layer'; // 'layer' | 'component' | 'template' | 'resource'

  echartsBarOption = {
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ data: [5, 20, 36], type: 'bar' }]
  };
  echartsPieOption = {
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 40, name: 'A' },
        { value: 32, name: 'B' },
        { value: 28, name: 'C' }
      ]
    }]
  };
  echartsRadarOption = {
    radar: {
      indicator: [
        { name: '销售', max: 100 },
        { name: '管理', max: 100 },
        { name: '信息', max: 100 },
        { name: '客服', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [
        { value: [80, 90, 70, 60], name: '得分' }
      ]
    }]
  };
  echartsWordcloudOption = {
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      textStyle: { fontFamily: 'sans-serif', fontWeight: 'bold' },
      data: [
        { name: 'ECharts', value: 10000 },
        { name: '图表', value: 6181 },
        { name: '可视化', value: 4386 },
        { name: '数据', value: 4055 },
        { name: '词云', value: 2467 }
      ]
    }]
  };
  echartsPreviewOption: any = this.echartsBarOption; // 默认预览为柱状图

  selectedEchartsId: string | null = null;
  selectedChartData: any = null;

  chartOptionCode: string = '';

  appName: string = '';

  // 新增属性用于跟踪当前预览类型
  previewChartType: string = 'bar';

  previewVisible = false;
  previewElements: any[] = [];
  previewWidth = 900;
  previewHeight = 600;

  constructor(
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private applicationService: ApplicationService // 注入服务
  ) { }

  ngOnInit(): void {
    this.updateCanvasSize();
    window.addEventListener('resize', () => this.updateCanvasSize());
    setTimeout(() => this.initKonva(), 0);
    setTimeout(() => this.renderEchartsElements(), 100); // 初始化渲染

    // 获取路由 id 并请求应用名称
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.applicationService.get(id).subscribe((app: any) => {
          this.appName = app?.name || '';
          this.cdr.markForCheck();
        });
      }
    });
  }

  updateCanvasSize() {
    const container = document.querySelector('.canvas-area');
    if (container) {
      // 默认1920*1080，如果容器宽高更小则取容器宽高
      this.canvasWidth = Math.max(container.clientWidth, 1920);
      this.canvasHeight = Math.max(container.clientHeight, 1080);
    } else {
      this.canvasWidth = 1920;
      this.canvasHeight = 1080;
    }
    if (this.stage) {
      this.stage.width(this.canvasWidth);
      this.stage.height(this.canvasHeight);
    }
  }

  initKonva() {
    this.stage = new Konva.Stage({
      container: this.canvasContainer.nativeElement,
      width: this.canvasWidth,
      height: this.canvasHeight
    });
    // 初始化一个默认图层
    this.addLayer();
  }

  addLayer() {
    const layer = new Konva.Layer();
    this.stage.add(layer);
    this.layers.push(layer);
    this.setActiveLayer(this.layers.length - 1);
  }

  removeLayer(index: number) {
    if (this.layers.length <= 1) return; // 至少保留一个图层
    const layer = this.layers[index];
    layer.destroy();
    this.layers.splice(index, 1);
    if (this.activeLayerIndex >= this.layers.length) {
      this.activeLayerIndex = this.layers.length - 1;
    }
    this.setActiveLayer(this.activeLayerIndex);
  }

  setActiveLayer(index: number) {
    this.activeLayerIndex = index;
    // 移除所有 transformer
    this.layers.forEach(l => l.find('Transformer').forEach(t => t.destroy()));
    // 在当前图层添加 transformer
    this.transformer = new Konva.Transformer({
      enabledAnchors: [
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'middle-left', 'middle-right', 'top-center', 'bottom-center'
      ],
      rotateEnabled: true
    });
    this.layers[this.activeLayerIndex].add(this.transformer);
    this.layers[this.activeLayerIndex].batchDraw();
  }

  get activeLayer(): Konva.Layer {
    return this.layers[this.activeLayerIndex];
  }

  handleHoverStart(node: Konva.Node) {
    if ('fill' in node && typeof (node as any).fill === 'function') {
      (node as Konva.Shape).fill('lightblue');
      this.activeLayer.batchDraw();
    }
  }

  handleHoverEnd(node: Konva.Node) {
    if ('fill' in node && typeof (node as any).fill === 'function') {
      (node as Konva.Shape).fill('blue');
      this.activeLayer.batchDraw();
    }
  }

  onDblClick(node: Konva.Node) {
    alert('Circle double-clicked!');
  }

  onPaletteDragStart(type: string) {
    this.draggingType = type;
  }

  onPaletteDragEnd(event: DragEvent) {
    this.draggingType = null;
  }

  onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.draggingType) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.addElement(this.draggingType, x, y);
    this.draggingType = null;
  }

  onCanvasDragOver(event: DragEvent) {
    event.preventDefault();
  }

  addElement(type: string, x?: number, y?: number) {
    if (!this.activeLayer) return;
    // ECharts 图表类型统一处理
    let chartOption: any = null;
    let chartType = '';
    if (type === 'echarts-bar') {
      chartOption = this.echartsBarOption;
      chartType = 'bar';
    } else if (type === 'echarts-pie') {
      chartOption = this.echartsPieOption;
      chartType = 'pie';
    } else if (type === 'echarts-radar') {
      chartOption = this.echartsRadarOption;
      chartType = 'radar';
    } else if (type === 'echarts-wordcloud') {
      chartOption = this.echartsWordcloudOption;
      chartType = 'wordcloud';
    }
    if (chartOption) {
      const offCanvas: any = document.createElement('canvas');
      offCanvas.width = 300;
      offCanvas.height = 200;
      // 存储完整 option 到 canvas
      offCanvas.__chartType = chartType;
      offCanvas.__chartOption = chartOption;
      offCanvas.__chartData = this.extractChartData(chartOption, chartType);
      const isWordcloud = chartOption?.series?.[0]?.type === 'wordCloud';
      const renderChart = (echarts: any) => {
        const chart = echarts.init(offCanvas);
        chart.setOption(chartOption);
        setTimeout(() => {
          const konvaImg = new Konva.Image({
            x: x ?? 100,
            y: y ?? 100,
            width: 300,
            height: 200,
            image: offCanvas,
            draggable: true
          });
          // 标记为图表组件
          konvaImg.setAttr('isChart', true);
          this.activeLayer.add(konvaImg);
          konvaImg.on('mousedown', (evt) => this.selectElement(evt.target));
          konvaImg.on('transform', (evt) => this.onTransform(evt.target));
          this.activeLayer.batchDraw();
        }, 500);
      };
      if (isWordcloud) {
        Promise.all([
          import('echarts'),
          import('echarts-wordcloud')
        ]).then(([echarts]) => {
          renderChart(echarts);
        });
      } else {
        import('echarts').then(echarts => {
          renderChart(echarts);
        });
      }
      return;
    }
  }

  // 提取图表数据用于编辑
  extractChartData(option: any, type: string) {
    if (type === 'bar') {
      return {
        xAxis: option.xAxis.data,
        series: option.series[0].data
      };
    }
    if (type === 'pie') {
      return {
        data: option.series[0].data
      };
    }
    if (type === 'radar') {
      return {
        indicator: option.radar.indicator,
        value: option.series[0].data[0].value
      };
    }
    if (type === 'wordcloud') {
      return {
        data: option.series[0].data
      };
    }
    return {};
  }

  selectElement(node: Konva.Node) {
    this.selectedNode = node;
    this.transformer.nodes([node]);
    this.activeLayer.batchDraw();
    // 图表代码编辑
    if (node instanceof Konva.Image && node.image()) {
      let chartType = '';
      let chartData: any = {};
      let chartOption: any = {};
      if (node.attrs.image && node.attrs.image.__chartType) {
        chartType = node.attrs.image.__chartType;
        chartData = node.attrs.image.__chartData;
        chartOption = node.attrs.image.__chartOption;
      }
      this.selectedChartData = {
        type: chartType,
        data: chartData,
        node: node
      };
      // 优先用 __chartOption，否则用默认 option
      if (chartOption) {
        this.chartOptionCode = JSON.stringify(chartOption, null, 2);
      } else {
        this.chartOptionCode = JSON.stringify(this.getDefaultChartOption(chartType, chartData), null, 2);
      }
    } else {
      this.selectedChartData = null;
      this.chartOptionCode = '';
    }
  }

  // 获取默认 option（用于首次编辑）
  getDefaultChartOption(type: string, data: any): any {
    if (type === 'bar') {
      return {
        xAxis: { type: 'category', data: data.xAxis },
        yAxis: { type: 'value' },
        series: [{ data: data.series, type: 'bar' }]
      };
    }
    if (type === 'pie') {
      return {
        series: [{
          type: 'pie',
          radius: '60%',
          data: data.data
        }]
      };
    }
    if (type === 'radar') {
      return {
        radar: { indicator: data.indicator },
        series: [{
          type: 'radar',
          data: [{ value: data.value, name: '得分' }]
        }]
      };
    }
    if (type === 'wordcloud') {
      return {
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          textStyle: { fontFamily: 'sans-serif', fontWeight: 'bold' },
          data: data.data
        }]
      };
    }
    return {};
  }

  // 编辑保存（代码模式）
  onChartOptionCodeSave() {
    if (!this.selectedChartData || !this.selectedChartData.node) return;
    let option: any;
    try {
      option = JSON.parse(this.chartOptionCode);
    } catch (e) {
      alert('option 格式错误，请检查 JSON 语法');
      return;
    }
    const node = this.selectedChartData.node as Konva.Image;
    const type = this.selectedChartData.type;
    // 重新渲染到canvas
    const offCanvas: any = document.createElement('canvas');
    offCanvas.width = node.width();
    offCanvas.height = node.height();
    offCanvas.__chartType = type;
    offCanvas.__chartOption = option;
    offCanvas.__chartData = this.extractChartData(option, type);
    const isWordcloud = type === 'wordcloud' || (option.series && option.series[0]?.type === 'wordCloud');
    const renderChart = (echarts: any) => {
      const chart = echarts.init(offCanvas);
      chart.setOption(option);
      setTimeout(() => {
        node.image(offCanvas);
        this.activeLayer.batchDraw();
      }, 500);
    };
    if (isWordcloud) {
      Promise.all([
        import('echarts'),
        import('echarts-wordcloud')
      ]).then(([echarts]) => {
        renderChart(echarts);
      });
    } else {
      import('echarts').then(echarts => {
        renderChart(echarts);
      });
    }
  }

  renderEchartsElement(chartId: string) {
    const canvasArea = document.querySelector('.canvas-area');
    if (!canvasArea) return;
    const el = this.canvasElements.find(e => e.type === 'echarts' && e.id === chartId);
    if (!el) return;
    // 已存在则不重复渲染
    if (document.getElementById(el.id)) return;

    const chartDiv = document.createElement('div');
    chartDiv.id = el.id;
    chartDiv.className = 'echarts-canvas-item';
    chartDiv.style.position = 'absolute';
    chartDiv.style.left = el.x + 'px';
    chartDiv.style.top = el.y + 'px';
    chartDiv.style.width = el.width + 'px';
    chartDiv.style.height = el.height + 'px';
    chartDiv.style.zIndex = '20';
    chartDiv.style.background = '#fff';
    chartDiv.style.border = '1px solid #ccc';
    chartDiv.style.boxShadow = '0 2px 8px #0001';
    chartDiv.style.overflow = 'hidden';

    // 拖动
    let dragging = false, dragStartX = 0, dragStartY = 0, origX = 0, origY = 0;
    chartDiv.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).classList.contains('echarts-resize-handle')) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      origX = el.x;
      origY = el.y;
      document.body.style.userSelect = 'none';
      this.selectedEchartsId = el.id; // 选中图表
      this.cdr.markForCheck();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      el.x = origX + dx;
      el.y = origY + dy;
      chartDiv.style.left = el.x + 'px';
      chartDiv.style.top = el.y + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        document.body.style.userSelect = '';
      }
    });

    // 右下角缩放
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'echarts-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '16px';
    resizeHandle.style.height = '16px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.background = 'rgba(25,118,210,0.3)';
    resizeHandle.style.borderRadius = '0 0 6px 0';
    resizeHandle.style.zIndex = '21';
    chartDiv.appendChild(resizeHandle);

    let resizing = false, startX = 0, startY = 0, startW = 0, startH = 0, chartInstance: any = null;
    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = el.width;
      startH = el.height;
      document.body.style.userSelect = 'none';
      this.selectedEchartsId = el.id; // 选中图表
      this.renderEchartsElements(); // 重新渲染高亮
      this.cdr.markForCheck();
    });
    document.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.width = Math.max(120, startW + dx);
      el.height = Math.max(80, startH + dy);
      chartDiv.style.width = el.width + 'px';
      chartDiv.style.height = el.height + 'px';
      if (chartInstance) chartInstance.resize();
    });
    document.addEventListener('mouseup', () => {
      if (resizing) {
        resizing = false;
        document.body.style.userSelect = '';
        if (chartInstance) chartInstance.resize();
      }
    });

    canvasArea.appendChild(chartDiv);

    // 判断是否为词云图
    const isWordcloud = el.option?.series?.[0]?.type === 'wordCloud';
    if (isWordcloud) {
      Promise.all([
        import('echarts'),
        import('echarts-wordcloud')
      ]).then(([echarts]) => {
        const chartInstance = echarts.init(chartDiv);
        chartInstance.setOption(el.option || this.echartsPreviewOption);
      });
    } else {
      import('echarts').then(echarts => {
        const chartInstance = echarts.init(chartDiv);
        chartInstance.setOption(el.option || this.echartsPreviewOption);
      });
    }
  }

  renderEchartsElements() {
    const canvasArea = document.querySelector('.canvas-area');
    if (!canvasArea) return;
    // 清理已存在的 echarts div
    canvasArea.querySelectorAll('.echarts-canvas-item').forEach(div => div.remove());
    this.canvasElements.forEach(el => {
      if (el.type === 'echarts') {
        const chartDiv = document.createElement('div');
        chartDiv.id = el.id;
        chartDiv.className = 'echarts-canvas-item';
        chartDiv.style.position = 'absolute';
        chartDiv.style.left = el.x + 'px';
        chartDiv.style.top = el.y + 'px';
        chartDiv.style.width = el.width + 'px';
        chartDiv.style.height = el.height + 'px';
        chartDiv.style.zIndex = '20';
        chartDiv.style.background = '#fff';
        chartDiv.style.border = (this.selectedEchartsId === el.id)
          ? '2px solid #1976d2'
          : '1px solid #ccc';
        chartDiv.style.boxShadow = (this.selectedEchartsId === el.id)
          ? '0 0 12px #1976d2'
          : '0 2px 8px #0001';
        chartDiv.style.overflow = 'hidden';

        // 拖动
        let dragging = false, dragStartX = 0, dragStartY = 0, origX = 0, origY = 0;
        chartDiv.addEventListener('mousedown', (e) => {
          if ((e.target as HTMLElement).classList.contains('echarts-resize-handle')) return;
          dragging = true;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
          origX = el.x;
          origY = el.y;
          document.body.style.userSelect = 'none';
          this.selectedEchartsId = el.id; // 选中图表
          this.renderEchartsElements(); // 重新渲染高亮
          this.cdr.markForCheck();
        });
        document.addEventListener('mousemove', (e) => {
          if (!dragging) return;
          const dx = e.clientX - dragStartX;
          const dy = e.clientY - dragStartY;
          el.x = origX + dx;
          el.y = origY + dy;
          chartDiv.style.left = el.x + 'px';
          chartDiv.style.top = el.y + 'px';
        });
        document.addEventListener('mouseup', () => {
          if (dragging) {
            dragging = false;
            document.body.style.userSelect = '';
          }
        });

        // 右下角缩放
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'echarts-resize-handle';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.right = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.width = '16px';
        resizeHandle.style.height = '16px';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.background = 'rgba(25,118,210,0.3)';
        resizeHandle.style.borderRadius = '0 0 6px 0';
        resizeHandle.style.zIndex = '21';
        chartDiv.appendChild(resizeHandle);

        let resizing = false, startX = 0, startY = 0, startW = 0, startH = 0, chartInstance: any = null;
        resizeHandle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          resizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startW = el.width;
          startH = el.height;
          document.body.style.userSelect = 'none';
          this.selectedEchartsId = el.id; // 选中图表
          this.renderEchartsElements(); // 重新渲染高亮
          this.cdr.markForCheck();
        });
        document.addEventListener('mousemove', (e) => {
          if (!resizing) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          el.width = Math.max(120, startW + dx);
          el.height = Math.max(80, startH + dy);
          chartDiv.style.width = el.width + 'px';
          chartDiv.style.height = el.height + 'px';
          if (chartInstance) chartInstance.resize();
        });
        document.addEventListener('mouseup', () => {
          if (resizing) {
            resizing = false;
            document.body.style.userSelect = '';
            if (chartInstance) chartInstance.resize();
          }
        });

        canvasArea.appendChild(chartDiv);

        const isWordcloud = el.option?.series?.[0]?.type === 'wordCloud';
        if (isWordcloud) {
          Promise.all([
            import('echarts'),
            import('echarts-wordcloud')
          ]).then(([echarts]) => {
            const chartInstance = echarts.init(chartDiv);
            chartInstance.setOption(el.option || this.echartsPreviewOption);
          });
        } else {
          import('echarts').then(echarts => {
            const chartInstance = echarts.init(chartDiv);
            chartInstance.setOption(el.option || this.echartsPreviewOption);
          });
        }
      }
    });
  }

  // 编辑保存
  saveChartData() {
    if (!this.selectedChartData || !this.selectedChartData.node) return;
    const node = this.selectedChartData.node as Konva.Image;
    const type = this.selectedChartData.type;
    const data = this.selectedChartData.data;
    let option: any = {};
    if (type === 'bar') {
      option = {
        xAxis: { type: 'category', data: data.xAxis },
        yAxis: { type: 'value' },
        series: [{ data: data.series, type: 'bar' }]
      };
    } else if (type === 'pie') {
      option = {
        series: [{
          type: 'pie',
          radius: '60%',
          data: data.data
        }]
      };
    } else if (type === 'radar') {
      option = {
        radar: { indicator: data.indicator },
        series: [{
          type: 'radar',
          data: [{ value: data.value, name: '得分' }]
        }]
      };
    } else if (type === 'wordcloud') {
      option = {
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          textStyle: { fontFamily: 'sans-serif', fontWeight: 'bold' },
          data: data.data
        }]
      };
    }
    // 重新渲染到canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = node.width();
    offCanvas.height = node.height();
    this.setCanvasChartProps(offCanvas, { type, option, data: JSON.parse(JSON.stringify(data)) });
    const isWordcloud = type === 'wordcloud';
    const renderChart = (echarts: any) => {
      const chart = echarts.init(offCanvas);
      chart.setOption(option);
      setTimeout(() => {
        node.image(offCanvas);
        this.activeLayer.batchDraw();
      }, 500);
    };
    if (isWordcloud) {
      Promise.all([
        import('echarts'),
        import('echarts-wordcloud')
      ]).then(([echarts]) => {
        renderChart(echarts);
      });
    } else {
      import('echarts').then(echarts => {
        renderChart(echarts);
      });
    }
  }

  setSidebar(type: string) {
    this.activeSidebar = type;
  }

  moveSelectedUp() {
    if (this.selectedNode) {
      this.selectedNode.moveUp();
      this.activeLayer.batchDraw();
      return;
    }
    // ...可选: ECharts层级操作...
  }
  moveSelectedDown() {
    if (this.selectedNode) {
      this.selectedNode.moveDown();
      this.activeLayer.batchDraw();
      return;
    }
  }
  moveSelectedToTop() {
    if (this.selectedNode) {
      this.selectedNode.moveToTop();
      this.activeLayer.batchDraw();
      return;
    }
  }
  moveSelectedToBottom() {
    if (this.selectedNode) {
      this.selectedNode.moveToBottom();
      this.activeLayer.batchDraw();
      return;
    }
  }

  onChartDataSave() {
    if (!this.selectedChartData) return;
    // 格式化输入
    if (this.selectedChartData.type === 'bar') {
      if (typeof this.selectedChartData.data.xAxis === 'string') {
        this.selectedChartData.data.xAxis = this.selectedChartData.data.xAxis.split(',').map((s: any) => s.trim());
      }
      if (typeof this.selectedChartData.data.series === 'string') {
        this.selectedChartData.data.series = this.selectedChartData.data.series.split(',').map((s: any) => Number(s.trim()));
      }
    }
    if (this.selectedChartData.type === 'radar') {
      if (typeof this.selectedChartData.data.value === 'string') {
        this.selectedChartData.data.value = this.selectedChartData.data.value.split(',').map((s: any) => Number(s.trim()));
      }
    }
    this.saveChartData();
  }

  previewCanvas() {
    if (!this.stage) return;
    const dataUrl = this.stage.toDataURL({ pixelRatio: 2 });
    const html = `
      <html>
        <head>
          <title>画布预览 - ${this.appName}</title>
          <style>
            body { margin:0; display:flex; align-items:center; justify-content:center; background:#f5f5f5; }
            img { box-shadow:0 2px 16px #0002; border-radius:8px; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Canvas Preview"/>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  showPreview() {
    // 遍历 Konva 图层和节点，转换为 previewElements
    const elements: any[] = [];
    this.layers.forEach(layer => {
      layer.getChildren().forEach(node => {
        console.log('处理节点:', node);
        const type = node.getClassName();
        if (type === 'Text') {
          elements.push({
            type: 'text',
            x: node.x(),
            y: node.y(),
            width: node.width(),
            height: node.height(),
            content: (node as any).text(),
            fontSize: (node as any).fontSize(),
            color: (node as any).fill()
          });
        } else if (type === 'Image') {
          // 判断是否为图表组件
          if (node.getAttr('isChart')) {
            // 始终存储完整的 option
            let option = node.attrs.image.__chartOption;
            elements.push({
              type: 'echarts',
              x: node.x(),
              y: node.y(),
              width: node.width(),
              height: node.height(),
              option: option
            });
          } else {
            const img: any = (node as any).image();
            if (img && img.src) {
              elements.push({
                type: 'image',
                x: node.x(),
                y: node.y(),
                width: node.width(),
                height: node.height(),
                url: img.src,
                alt: ''
              });
            }
          }
        } else if (type === 'Label') {
          const textNode = (node as any).findOne('Text');
          if (textNode) {
            elements.push({
              type: 'text',
              x: node.x(),
              y: node.y(),
              width: node.width(),
              height: node.height(),
              content: textNode.text(),
              fontSize: textNode.fontSize(),
              color: textNode.fill()
            });
          }
        } else if (type === 'Rect' && node.name() === 'button') {
          elements.push({
            type: 'button',
            x: node.x(),
            y: node.y(),
            width: node.width(),
            height: node.height(),
            content: node.attrs.content || '按钮',
            fontSize: node.attrs.fontSize || 16,
            color: node.attrs.color || '#fff',
            background: node.attrs.background || '#1976d2'
          });
        } else if (type === 'Image' && node.attrs.image && node.attrs.image.__chartType) {
          // ECharts 图表
          elements.push({
            type: 'echarts',
            x: node.x(),
            y: node.y(),
            width: node.width(),
            height: node.height(),
            option: node.attrs.image.__chartOption || node.attrs.image.__chartData
          });
        }
      });
    });
    // 使用 localStorage 传递数据，图表组件包含完整 option 字段
    localStorage.setItem('canvasPreviewElements', JSON.stringify(elements));
    localStorage.setItem('canvasPreviewWidth', String(this.canvasWidth));
    localStorage.setItem('canvasPreviewHeight', String(this.canvasHeight));
    window.open('/visualization/canvas-preview', '_blank');
  }

  closePreview() {
    this.previewVisible = false;
  }

  onTransform(node: Konva.Node) {
    this.cdr.markForCheck();
  }

  getNodeFill(node: Konva.Node | null): string {
    if (node && 'fill' in node && typeof (node as any).fill === 'function') {
      return (node as any).fill() || '#000000';
    }
    return '#000000';
  }
  getNodeStroke(node: Konva.Node | null): string {
    if (node && 'stroke' in node && typeof (node as any).stroke === 'function') {
      return (node as any).stroke() || '#000000';
    }
    return '#000000';
  }
  getNodeStrokeWidth(node: Konva.Node | null): number {
    if (node && 'strokeWidth' in node && typeof (node as any).strokeWidth === 'function') {
      return (node as any).strokeWidth() || 1;
    }
    return 1;
  }

  getLabelText() {
    if (this.selectedNode && this.selectedNode.getClassName() === 'Label') {
      const textNode = (this.selectedNode as any).findOne('Text');
      return textNode ? textNode.text() : '';
    }
    return '';
  }
  getLabelTextFill() {
    if (this.selectedNode && this.selectedNode.getClassName() === 'Label') {
      const textNode = (this.selectedNode as any).findOne('Text');
      return textNode ? textNode.fill() : '#000000';
    }
    return '#000000';
  }
  getLabelTextFontSize() {
    if (this.selectedNode && this.selectedNode.getClassName() === 'Label') {
      const textNode = (this.selectedNode as any).findOne('Text');
      return textNode ? textNode.fontSize() : 18;
    }
    return 18;
  }
  updateNodeStyle(key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input?.value;
    if (!this.selectedNode || value === undefined) return;
    if (key === 'fill' && 'fill' in this.selectedNode) {
      (this.selectedNode as any).fill(value);
    } else if (key === 'stroke' && 'stroke' in this.selectedNode) {
      (this.selectedNode as any).stroke(value);
    } else if (key === 'strokeWidth' && 'strokeWidth' in this.selectedNode) {
      (this.selectedNode as any).strokeWidth(Number(value));
    }
    this.activeLayer.batchDraw();
  }
  updateLabelTextStyle(key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input?.value;
    if (this.selectedNode && this.selectedNode.getClassName() === 'Label' && value !== undefined) {
      const textNode = (this.selectedNode as any).findOne('Text');
      if (textNode) {
        if (key === 'fill') textNode.fill(value);
        else if (key === 'fontSize') textNode.fontSize(Number(value));
        else if (key === 'text') textNode.text(value);
        this.activeLayer.batchDraw();
      }
    }
  }

  getImageSrc() {
    if (this.selectedNode && this.selectedNode.getClassName() === 'Image') {
      const img: any = (this.selectedNode as Konva.Image).image();
      return img && img.src ? img.src : '';
    }
    return '';
  }
  onImageSrcChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.value === 'string') {
      this.updateImageSrc(input.value);
    }
  }
  updateImageSrc(url: string) {
    if (this.selectedNode && this.selectedNode.getClassName() === 'Image') {
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        (this.selectedNode as Konva.Image).image(img);
        this.activeLayer.batchDraw();
      };
    }
  }

  // canvas 扩展属性类型断言
  setCanvasChartProps(canvas: HTMLCanvasElement, props: any) {
    (canvas as any).__chartType = props.type;
    (canvas as any).__chartOption = props.option;
    (canvas as any).__chartData = props.data;
  }

  // 新增方法：鼠标悬停时更新预览
  onPreviewChartHover(type: string) {
    this.previewChartType = type;
    if (type === 'bar') {
      this.echartsPreviewOption = this.echartsBarOption;
    } else if (type === 'pie') {
      this.echartsPreviewOption = this.echartsPieOption;
    } else if (type === 'radar') {
      this.echartsPreviewOption = this.echartsRadarOption;
    } else if (type === 'wordcloud') {
      this.echartsPreviewOption = this.echartsWordcloudOption;
    }
  }
}