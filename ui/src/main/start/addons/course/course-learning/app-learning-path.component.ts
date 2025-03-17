import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-learning-path',
  templateUrl: './app-learning-path.component.html',
  styleUrls: ['./app-learning-path.component.scss']
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
