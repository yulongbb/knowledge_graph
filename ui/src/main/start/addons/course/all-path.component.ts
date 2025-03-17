import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-all-path',
  template: `
    <div class="container">
      <div class="path-wrapper">
        <div class="path-header">
          <h3 class="path-title">
            Angular 知识图谱 - {{ getViewModeTitle() }}
          </h3>
          <button *ngIf="viewMode !== 'path'" 
                  class="back-btn"
                  (click)="returnToPath()">
            <i class="fas fa-arrow-left"></i>
            返回图谱
          </button>
        </div>

        <!-- 图例说明 -->
        <div class="path-legend" *ngIf="viewMode === 'path'">
          <div class="legend-title">图例说明：</div>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-circle not-started"></div>
              <span>未开始</span>
            </div>
            <div class="legend-item">
              <div class="legend-circle in-progress"></div>
              <span>学习中</span>
            </div>
            <div class="legend-item">
              <div class="legend-circle mastery-low"></div>
              <span>掌握度低 (< 60%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-circle mastery-medium"></div>
              <span>掌握度中等 (60-80%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-circle mastery-high"></div>
              <span>掌握度高 (> 80%)</span>
            </div>
          </div>
        </div>

        <!-- 知识图谱视图 -->
        <div class="path-container" 
             #pathContainer
             *ngIf="viewMode === 'path'">
          <div *ngFor="let point of knowledgePoints; let i = index" 
               class="knowledge-point" 
               [attr.data-point-id]="i">
            <div class="checkpoint-wrapper">
              <div class="checkpoint" 
                   [ngClass]="{
                     'completed': point.completed,
                     'not-completed': !point.completed,
                     'mastery-low': point.mastery > 0 && point.mastery < 60,
                     'mastery-medium': point.mastery >= 60 && point.mastery < 80,
                     'mastery-high': point.mastery >= 80
                   }"
                   (click)="togglePoint(i)">
                <svg class="progress-ring" width="60" height="60">
                  <circle class="checkpoint-background"
                          cx="30" cy="30" r="26"
                          [attr.fill]="point.completed ? '#58cc02' : '#ccc'"/>
                  <!-- 只对有学习进度的显示圆环 -->
                  <ng-container *ngIf="point.mastery > 0">
                    <circle class="progress-ring-background"
                            cx="30" cy="30" r="26"
                            fill="transparent"
                            stroke-width="6"/>
                    <circle class="progress-ring-circle"
                            cx="30" cy="30" r="26"
                            fill="transparent"
                            stroke-width="6"
                            [style.strokeDasharray]="2 * PI * 26"
                            [style.strokeDashoffset]="2 * PI * 26 * (1 - point.mastery / 100)"/>
                  </ng-container>
                </svg>
                <span class="checkpoint-number">{{ i + 1 }}</span>
              </div>
              <div class="checkpoint-title">{{ point.title }}</div>
            </div>
          </div>
        </div>

        <!-- 弹框内容 -->
        <div *ngIf="selectedPoint !== null" 
             class="point-content"
             [class.show]="selectedPoint !== null"
             [style.top.px]="popupPosition.top"
             [style.left.px]="popupPosition.left"
             [style.right.px]="popupPosition.right">
          <div class="point-header">
            <div class="point-title">{{ getSelectedPoint()?.title }}</div>
            <div class="point-status-icon" [title]="getSelectedPoint()?.status | titlecase">
              <i class="fas" [ngClass]="getStatusIcon(getSelectedPoint())"></i>
            </div>
          </div>
          <div class="point-desc">{{ getSelectedPoint()?.description }}</div>
          <ng-container *ngIf="getSelectedPoint() as point">
            <div class="point-progress" *ngIf="point.mastery > 0">
              掌握度: {{ point.mastery }}%
            </div>
            <div class="point-actions">
              <button class="action-btn start-btn" 
                      (click)="startLearning(point)">
                <i class="fas fa-play"></i>
                开始学习
              </button>
              <button class="action-btn test-btn" 
                      [disabled]="!point.mastery"
                      (click)="startTest(point)">
                <i class="fas fa-tasks"></i>
                知识测试
              </button>
            </div>
          </ng-container>
        </div>

        <!-- 视频学习视图 -->
        <div class="video-container" *ngIf="viewMode === 'video'">
          <div class="video-wrapper">
            <iframe [src]="currentPoint?.videoUrl | safe"
                   frameborder="0" 
                   allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                   allowfullscreen>
            </iframe>
          </div>
          <div class="video-info">
            <h4>{{ currentPoint?.title }}</h4>
            <p>{{ currentPoint?.description }}</p>
          </div>
        </div>

        <!-- 修改测试题视图 -->
        <div class="test-container" *ngIf="viewMode === 'test'">
          <app-quiz 
            [pointId]="currentPoint?.id"
            (quizComplete)="onQuizComplete($event)"
            (quizClose)="returnToPath()">
          </app-quiz>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      gap: 30px;
      padding: 20px;
      background: #f5f7fa;
      min-height: calc(100vh - 40px);
    }

    .chapters-sidebar {
      width: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 24px;
      height: fit-content;
    }

    .chapter-header {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .chapter-progress {
      margin-left: auto;
      font-size: 12px;
      color: #666;
    }

    .sidebar-title {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
    }

    .chapter-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .chapter-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .chapter-item:hover {
      background-color: #f5f5f5;
    }

    .chapter-item.active {
      background-color: #e6f4ea;
    }

    .chapter-number {
      width: 24px;
      height: 24px;
      background: #58cc02;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .chapter-title {
      font-size: 16px;
      color: #333;
    }

    .path-wrapper {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 24px;
    }

    .path-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #eee;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: #f5f5f5;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #eee;
      }
    }

    .path-title {
      font-size: 24px;
      color: #333;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #eee;
    }

    .path-legend {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
    }

    .legend-title {
      font-size: 14px;
      font-weight: bold;
      color: #666;
      margin-bottom: 8px;
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .legend-circle.not-started {
      background: #ccc;
    }

    .legend-circle.in-progress {
      background: #58cc02;
    }

    .legend-circle.mastery-low {
      background: #dc3545;
    }

    .legend-circle.mastery-medium {
      background: #ffc107;
    }

    .legend-circle.mastery-high {
      background: #ffbf00;
    }

    .path-container {
      position: relative;
      width: 100%;
      padding: 20px;
      height: calc(100vh - 200px);
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(6, minmax(80px, 1fr));
      gap: 20px;
      align-items: start;
    }

    .knowledge-point {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      min-height: 100px; /* 增加高度以适应标题 */
    }

    .point-content {
      position: fixed;
      background: white;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid #ddd;
      transition: all 0.2s ease;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      width: 280px;
      z-index: 1000;
    }

    .point-content-left {
      top: 50%;
      right: calc(100% + 10px);
      transform: translateY(-50%);
    }

    .point-content-right {
      top: 50%;
      left: calc(100% + 10px);
      transform: translateY(-50%);
    }

    .point-content.show {
      opacity: 1;
      visibility: visible;
      pointer-events: all;
    }

    .point-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .point-status-icon {
      font-size: 16px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .point-progress {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }

    .point-not-started {
      border-left-color: #ddd;
      .point-status-icon { color: #999; }
    }

    .point-in-progress {
      border-left-color: #007bff;
      .point-status-icon { color: #007bff; }
    }

    .point-completed {
      border-left-color: #28a745;
      .point-status-icon { color: #28a745; }
    }

    .point-mastered {
      border-left-color: #ffbf00;
      .point-status-icon { color: #ffbf00; }
    }

    .point-needs-review {
      border-left-color: #dc3545;
      .point-status-icon { color: #dc3545; }
    }

    .point-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 10px;
    }

    .point-desc {
      font-size: 14px;
      color: #666;
    }

    .checkpoint {
      width: 50px;
      height: 50px;
      cursor: pointer;
      position: relative;
      // ...existing checkpoint styles...
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .checkpoint-background {
      transition: fill 0.3s;
    }

    .progress-ring-background {
      stroke: rgba(255, 255, 255, 0.3);
    }

    .progress-ring-circle {
      stroke: rgba(255, 255, 255, 0.8);
      transition: all 0.3s;
    }

    .checkpoint.mastery-low .progress-ring-circle {
      stroke: #dc3545;  // 红色表示掌握度低
    }

    .checkpoint.mastery-medium .progress-ring-circle {
      stroke: #ffc107;  // 黄色表示掌握度中等
    }

    .checkpoint.mastery-high .progress-ring-circle {
      stroke: #ffbf00;  // 金色表示掌握度高
    }

    // 对应的背景色
    .checkpoint.mastery-low .progress-ring-background {
      stroke: rgba(220, 53, 69, 0.2);
    }

    .checkpoint.mastery-medium .progress-ring-background {
      stroke: rgba(255, 193, 7, 0.2);
    }

    .checkpoint.mastery-high .progress-ring-background {
      stroke: rgba(255, 191, 0, 0.2);
    }

    .checkpoint-number {
      position: absolute;
      color: white;
      font-size: 20px;
      font-weight: bold;
      z-index: 3;
    }

    .progress-ring {
      position: absolute;
      transform: rotate(-90deg);
      width: 60px;
      height: 60px;
    }

    .progress-ring-background {
      stroke: rgba(255, 255, 255, 0.3);
    }

    .progress-ring-circle {
      stroke: rgba(255, 255, 255, 0.8);
      transition: stroke-dashoffset 0.3s;
    }

    .checkpoint:hover {
      transform: scale(1.1);
    }

    .checkpoint.active {
      transform: scale(1.1);
      
      .progress-ring-circle {
        stroke-width: 5;
      }
    }

    .point-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 12px;
      }

      &:hover {
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          transform: none;
        }
      }
    }

    .start-btn {
      background: #58cc02;
      color: white;
      &:hover {
        background: #46a302;
      }
    }

    .test-btn {
      background: #007bff;
      color: white;
      &:hover {
        background: #0056b3;
      }
    }

    .video-container,
    .test-container {
      padding: 20px;
      height: calc(100vh - 200px);
      overflow-y: auto;
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%; // 16:9 比例
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }

    .video-info,
    .test-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);

      h4 {
        margin: 0 0 10px 0;
        font-size: 20px;
        color: #333;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }

    .placeholder-text {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }

    .checkpoint-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .checkpoint-title {
      text-align: center;
      font-size: 12px;
      color: #666;
      line-height: 1.3;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `]
})
export class AllPathComponent implements AfterViewInit, OnDestroy {
  // 添加视图模式
  viewMode: 'path' | 'video' | 'test' = 'path';
  currentPoint: any = null;

  // Add PI constant at class level
  readonly PI = Math.PI;

  popupPosition: {
    top: number;
    left: number | null;
    right: number | null;
  } = {
    top: 0,
    left: null,
    right: null
  };

  // 移除 Portal 相关代码
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit() {} // 清空此方法
  ngOnDestroy() {} // 清空此方法

  knowledgePoints = [
    { 
      title: 'TypeScript基础', 
      description: '类型系统、接口、泛型等基础知识', 
      completed: true, 
      unlocked: true,
      mastery: 95,
      status: 'mastered'
    },
    { 
      title: '组件基础', 
      description: '组件创建、装饰器、模板语法', 
      completed: true, 
      unlocked: true,
      mastery: 90,
      status: 'mastered'
    },
    { 
      title: '数据绑定', 
      description: '插值、属性绑定、事件绑定、双向绑定', 
      completed: true, 
      unlocked: true,
      mastery: 85,
      status: 'mastered'
    },
    { 
      title: '内置指令', 
      description: '*ngIf, *ngFor, ngClass, ngStyle等', 
      completed: true, 
      unlocked: true,
      mastery: 80,
      status: 'completed'
    },
    { 
      title: '管道使用', 
      description: '日期、数字、异步等内置管道和自定义管道', 
      completed: true, 
      unlocked: true,
      mastery: 75,
      status: 'completed'
    },
    { 
      title: '生命周期', 
      description: 'ngOnInit, ngOnChanges等钩子函数', 
      completed: true, 
      unlocked: true,
      mastery: 70,
      status: 'completed'
    },
    { 
      title: '父子组件通信', 
      description: '@Input/@Output和EventEmitter使用', 
      completed: true, 
      unlocked: true,
      mastery: 65,
      status: 'completed'
    },
    { 
      title: '内容投影', 
      description: 'ng-content和多插槽投影', 
      completed: false, 
      unlocked: true,
      mastery: 40,
      status: 'in_progress'
    },
    { 
      title: '模板引用', 
      description: '@ViewChild和模板变量', 
      completed: false, 
      unlocked: true,
      mastery: 30,
      status: 'in_progress'
    },
    { 
      title: '动态组件', 
      description: 'ComponentFactoryResolver的使用', 
      completed: false, 
      unlocked: true,
      mastery: 20,
      status: 'in_progress'
    },
    { 
      title: '属性型指令', 
      description: '创建自定义属性指令', 
      completed: false, 
      unlocked: true,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '结构型指令', 
      description: '创建自定义结构型指令', 
      completed: false, 
      unlocked: true,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: 'HostListener', 
      description: '监听宿主元素事件', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '自定义管道', 
      description: '创建纯管道和非纯管道', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '服务创建', 
      description: '@Injectable装饰器和服务注册', 
      completed: false, 
      unlocked: true,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '依赖注入原理', 
      description: 'DI工作原理和提供者配置', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '注入层级', 
      description: '模块级和组件级注入', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '服务间通信', 
      description: '使用Subject实现服务通信', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '拦截器注入', 
      description: 'HTTP拦截器的依赖注入', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '路由配置', 
      description: '基本路由设置和参数传递', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '路由守卫', 
      description: '使用路由守卫保护路由', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '子路由', 
      description: '嵌套路由和子路由配置', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '模板驱动表单', 
      description: '使用NgModel创建表单', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '响应式表单', 
      description: '使用FormBuilder构建表单', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '表单验证', 
      description: '自定义验证器和异步验证', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: 'HttpClient', 
      description: '使用HttpClient进行请求', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '拦截器', 
      description: '使用HTTP拦截器', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    },
    { 
      title: '错误处理', 
      description: 'HTTP错误处理和重试机制', 
      completed: false, 
      unlocked: false,
      mastery: 0,
      status: 'not_started'
    }
  ];

  selectedPoint: number | null = null;

  getSelectedPoint() {
    return this.selectedPoint !== null ? this.knowledgePoints[this.selectedPoint] : null;
  }

  togglePoint(index: number) {
    if (this.selectedPoint === index) {
      this.selectedPoint = null;
    } else {
      const point = document.querySelector(`[data-point-id="${index}"] .checkpoint`) as HTMLElement;
      if (point) {
        const rect = point.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const isRightSide = rect.left < viewportWidth / 2;
        
        // 计算弹框位置
        this.popupPosition = {
          top: rect.top - 10,
          left: isRightSide ? rect.right + 10 : null,
          right: isRightSide ? null : viewportWidth - rect.left + 10
        };
        
        this.selectedPoint = index;
      }
    }
  }

  getPointStyle(index: number) {
    return {}; // 不再需要特定定位
  }

  isRightSide(index: number): boolean {
    const pointsPerRow = 6; // 修改为6个每行
    const col = index % pointsPerRow;
    return col < 3; // 左侧3个向右，右侧3个向左
  }

  getProgressText(chapter: any) {
    const completedPoints = chapter.knowledgePoints.filter((point: any) => point.completed).length;
    const totalPoints = chapter.knowledgePoints.length;
    return `${completedPoints} / ${totalPoints}`;
  }

  getPointClassList(point: any, index: number): {[key: string]: boolean} {
    return {
      'show': this.selectedPoint === index,
      'point-not-started': point.status === 'not_started',
      'point-in-progress': point.status === 'in_progress',
      'point-completed': point.status === 'completed',
      'point-mastered': point.status === 'mastered',
      'point-needs-review': point.status === 'needs_review'
    };
  }

  getStatusIcon(point: any | null) {
    if (!point) return 'fa-circle';
    const iconMap: {[key: string]: string} = {
      'not_started': 'fa-circle',
      'in_progress': 'fa-spinner',
      'completed': 'fa-check-circle',
      'mastered': 'fa-star',
      'needs_review': 'fa-exclamation-circle'
    };
    return iconMap[point.status] || 'fa-circle';
  }

  getStatusText(point: any) {
    const textMap: {[key: string]: string} = {
      'not_started': '未开始',
      'in_progress': '学习中',
      'completed': '已完成',
      'mastered': '已掌握',
      'needs_review': '需要复习'
    };
    return textMap[point.status] || '未开始';
  }

  getViewModeTitle(): string {
    switch(this.viewMode) {
      case 'video': return '视频学习';
      case 'test': return '知识测试';
      default: return '知识图谱';
    }
  }

  returnToPath() {
    this.viewMode = 'path';
    this.currentPoint = null;
    this.selectedPoint = null;
  }

  startLearning(point: any) {
    this.currentPoint = point;
    this.viewMode = 'video';
    this.selectedPoint = null; // 关闭弹框
  }

  startTest(point: any) {
    this.currentPoint = point;
    this.viewMode = 'test';
    this.selectedPoint = null; // 关闭弹框
  }

  onQuizComplete(result: any) {
    if (this.currentPoint && result.score >= 60) {
      this.currentPoint.mastery = Math.max(this.currentPoint.mastery, result.score);
      if (result.score >= 80) {
        this.currentPoint.status = 'mastered';
      } else {
        this.currentPoint.status = 'completed';
      }
      this.currentPoint.completed = true;
    } else if (this.currentPoint) {
      this.currentPoint.status = 'needs_review';
    }
  }
}
