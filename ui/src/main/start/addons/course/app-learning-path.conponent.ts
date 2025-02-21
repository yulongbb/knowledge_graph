import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-learning-path',
  template: `
    <div class="container">
      <div class="chapters-sidebar">
        <h2 class="sidebar-title">课程大纲</h2>
        <div class="chapter-list">
          <div *ngFor="let chapter of chapters; let i = index" 
               class="chapter-item"
               [ngClass]="{'active': selectedChapter === i}"
               (click)="selectChapter(i)">
            <div class="chapter-header">
              <span class="chapter-number">{{ i + 1 }}</span>
              <span class="chapter-title">{{ chapter.title }}</span>
              <span class="chapter-progress">{{ getProgressText(chapter) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="path-wrapper">
        <div class="path-header">
          <h3 class="path-title">
            {{ chapters[selectedChapter].title }} - 
            {{ getViewModeTitle() }}
          </h3>
          <button *ngIf="viewMode !== 'path'" 
                  class="back-btn"
                  (click)="returnToPath()">
            <i class="fas fa-arrow-left"></i>
            返回图谱
          </button>
        </div>

        <!-- 知识图谱视图 -->
        <div class="path-container" 
             #pathContainer
             *ngIf="viewMode === 'path'">
          <svg class="connection-lines">
            <path *ngFor="let line of connectionLines" 
                  [attr.d]="line"
                  class="connection-line">
            </path>
          </svg>
          <div *ngFor="let point of chapters[selectedChapter]?.knowledgePoints; let i = index" 
               class="knowledge-point" 
               [ngStyle]="getPointStyle(i)"
               [attr.data-point-id]="i">
            <div class="point-content" 
                 [ngClass]="getPointClassList(point, i)"
                 [class.point-content-hidden]="selectedPoint !== i"
                 [class.point-content-right]="isRightSide(i)"
                 [class.point-content-left]="!isRightSide(i)">
              <div class="point-header">
                <div class="point-title">{{ point.title }}</div>
                <div class="point-status-icon" [title]="getStatusText(point)">
                  <i class="fas" [ngClass]="getStatusIcon(point)"></i>
                </div>
              </div>
              <div class="point-desc">{{ point.description }}</div>
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
            </div>
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
          </div>
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

        <!-- 测试题视图 -->
        <div class="test-container" *ngIf="viewMode === 'test'">
          <div class="test-content">
            <h4>{{ currentPoint?.title }} - 知识测试</h4>
            <!-- 这里可以添加测试题组件 -->
            <div class="placeholder-text">测试题内容将在这里显示</div>
          </div>
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

    .path-container {
      position: relative;
      width: 100%;
      margin: 0 auto;
      min-height: 600px;
      padding: 20px;
      overflow: visible;
    }

    .path-line {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: transparent;
      border-left: 4px solid #ddd;
      border-radius: 20px;
      z-index: 0;
      border-left-style: dashed;
      clip-path: polygon(
        0% 0%,
        20% 20%,
        40% 10%,
        60% 30%,
        80% 20%,
        100% 40%,
        100% 100%,
        0% 100%
      );
    }

    .connection-lines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }

    .connection-line {
      fill: none;
      stroke: #ddd;
      stroke-width: 2;
      stroke-dasharray: 5,5;
    }

    .knowledge-point {
      position: absolute;
      display: flex;
      align-items: center;
      z-index: 1;
      background: transparent;
    }

    .point-content {
      position: absolute;
      background: white;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      border-left: 4px solid #ddd;
      transition: all 0.3s ease;
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      pointer-events: none;
      width: 280px;
      top: 50%;
      transform: translateY(-50%);
    }

    .point-content-left {
      right: calc(100% + 20px);
    }

    .point-content-right {
      left: calc(100% + 20px);
    }

    .point-content.show {
      opacity: 1;
      max-height: 200px;
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
      width: 60px;
      height: 60px;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s;
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
  `]
})
export class LearningPathComponent implements AfterViewInit {
  // 添加视图模式
  viewMode: 'path' | 'video' | 'test' = 'path';
  currentPoint: any = null;

  // Add PI constant at class level
  readonly PI = Math.PI;

  chapters = [
    {
      title: 'Angular 基础',
      completed: true,
      knowledgePoints: [
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
        }
      ]
    },
    {
      title: '深入组件',
      completed: false,
      knowledgePoints: [
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
        }
      ]
    },
    {
      title: '指令与管道',
      completed: false,
      knowledgePoints: [
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
        }
      ]
    },
    {
      title: '服务与依赖注入',
      completed: false,
      knowledgePoints: [
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
        }
      ]
    },
    {
      title: '路由导航',
      completed: false,
      knowledgePoints: [
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
        }
      ]
    },
    {
      title: '表单处理',
      completed: false,
      knowledgePoints: [
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
        }
      ]
    },
    {
      title: 'HTTP通信',
      completed: false,
      knowledgePoints: [
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
      ]
    }
  ];

  selectedChapter = 0;
  connectionLines: string[] = [];
  selectedPoint: number | null = null;

  ngAfterViewInit() {
    setTimeout(() => this.updateConnectionLines(), 100);
  }

  updateConnectionLines() {
    this.connectionLines = [];
    const points = this.chapters[this.selectedChapter]?.knowledgePoints || [];
    
    // 延迟更新以确保DOM已经渲染
    setTimeout(() => {
      for (let i = 0; i < points.length - 1; i++) {
        const start = this.getPointCoordinates(i);
        const end = this.getPointCoordinates(i + 1);
        
        if (start && end) {
          const path = this.createCurvedPath(start, end);
          this.connectionLines.push(path);
        }
      }
    }, 50);
  }

  getPointCoordinates(index: number): {x: number, y: number} | null {
    const element = document.querySelector(`[data-point-id="${index}"] .checkpoint`) as HTMLElement;
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const container = document.querySelector('.path-container') as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  }

  createCurvedPath(start: {x: number, y: number}, end: {x: number, y: number}): string {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const controlPointOffset = Math.abs(deltaX) * 0.5;
    
    // 根据点的位置调整曲线形状
    const cp1x = start.x + (deltaX > 0 ? controlPointOffset : -controlPointOffset);
    const cp2x = end.x + (deltaX > 0 ? -controlPointOffset : controlPointOffset);
    
    return `M ${start.x} ${start.y} 
            C ${cp1x} ${start.y},
              ${cp2x} ${end.y},
              ${end.x} ${end.y}`;
  }

  selectChapter(index: number) {
    this.selectedChapter = index;
    this.selectedPoint = null;      // 清除选中的知识点
    this.currentPoint = null;       // 清除当前学习的知识点
    this.viewMode = 'path';         // 切换回知识图谱视图
    setTimeout(() => this.updateConnectionLines(), 100);
  }

  togglePoint(index: number) {
    if (this.selectedPoint === index) {
      this.selectedPoint = null;
    } else {
      this.selectedPoint = index;
    }
    setTimeout(() => this.updateConnectionLines(), 300); // 等待动画完成后更新连接线
  }

  getPointStyle(index: number) {
    const points = this.chapters[this.selectedChapter]?.knowledgePoints || [];
    const totalPoints = points.length;
    
    const verticalSpacing = 150;
    const row = Math.floor(index / 2);
    const isEvenRow = row % 2 === 0;
    const isLastInRow = index % 2 === 1 || index === totalPoints - 1;
    
    // 调整左右位置，确保连线正确
    const leftPosition = isEvenRow 
      ? (isLastInRow ? '75%' : '25%')  // 偶数行：左25% 右75%
      : (isLastInRow ? '25%' : '75%'); // 奇数行：左75% 右25%
    
    return {
      top: `${row * verticalSpacing + 50}px`,  // 添加一些顶部padding
      left: leftPosition,
      width: '60px' // 固定宽度，确保定位准确
    };
  }

  isRightSide(index: number): boolean {
    const row = Math.floor(index / 2);
    const isEvenRow = row % 2 === 0;
    const isLastInRow = index % 2 === 1;
    return (isEvenRow && isLastInRow) || (!isEvenRow && !isLastInRow);
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

  getStatusIcon(point: any) {
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
    setTimeout(() => this.updateConnectionLines(), 100);
  }

  startLearning(point: any) {
    this.currentPoint = point;
    this.viewMode = 'video';
  }

  startTest(point: any) {
    this.currentPoint = point;
    this.viewMode = 'test';
  }
}
