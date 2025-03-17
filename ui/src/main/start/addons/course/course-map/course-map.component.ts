import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-course-map',
  templateUrl: './course-map.component.html',
  styleUrls: ['./course-map.component.scss']
})
export class CourseMapComponent implements OnInit {
  @Input() course: any;
  @ViewChild('cyContainer') cyContainer!: ElementRef;
  private cy: any;

  ngOnInit() {
    if (this.course?.path) {
      this.initializeMap();
    }
  }

  ngAfterViewInit() {
    if (this.course?.path) {
      this.initializeCytoscape();
    }
  }

  private initializeMap() {
    // 这里可以添加图谱visualization的逻辑
    // 比如使用D3.js或其他图表库来展示课程路径
    console.log('Initializing course map with path:', this.course.path);
  }

  private initializeCytoscape() {
    const elements = this.generateElements();
    
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#2c3e50',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'width': 'label',
            'height': 'label',
            'padding': '15px',
            'shape': 'ellipse',
            'text-wrap': 'wrap',
            'text-max-width': '100px'
          }
        },
        {
          selector: 'node.course',
          style: {
            'background-color': '#3498db',
            'font-size': '16px',
            'font-weight': 'bold',
            'width': '120px',
            'height': '120px',
            'border-width': '3px',
            'border-color': '#2980b9'
          }
        },
        {
          selector: 'node.chapter',
          style: {
            'background-color': '#2c3e50',
            'width': '100px',
            'height': '100px'
          }
        },
        {
          selector: 'node.topic',
          style: {
            'background-color': '#95a5a6',
            'font-size': '11px',
            'width': '80px',
            'height': '80px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#bdc3c7',
            'target-arrow-color': '#bdc3c7',
            'target-arrow-shape': 'triangle',
            'curve-style': 'unbundled-bezier',
            'control-point-distances': [40],
            'control-point-weights': [0.5]
          }
        }
      ],
      layout: {
        name: 'cose',
      }
    });

    // 添加节点交互
    this.cy.on('mouseover', 'node', (e: any) => {
      const node = e.target;
      node.style({
        'background-color': '#e74c3c',
        'border-width': '3px',
        'border-color': '#c0392b',
        'font-size': parseInt(node.style('font-size')) + 2 + 'px'
      });
      
      // 高亮相关节点和边
      const connectedEdges = node.connectedEdges();
      const connectedNodes = node.neighborhood('node');
      
      connectedEdges.style({
        'line-color': '#e74c3c',
        'target-arrow-color': '#e74c3c',
        'width': 4
      });
      
      connectedNodes.style({
        'border-width': '3px',
        'border-color': '#e74c3c'
      });
    });

    this.cy.on('mouseout', 'node', (e: any) => {
      const node = e.target;
      const defaultColor = node.hasClass('course') ? '#3498db' : 
                         node.hasClass('chapter') ? '#2c3e50' : '#95a5a6';
      
      node.style({
        'background-color': defaultColor,
        'border-width': node.hasClass('course') ? '3px' : '0',
        'border-color': node.hasClass('course') ? '#2980b9' : defaultColor,
        'font-size': node.hasClass('course') ? '16px' : 
                    node.hasClass('chapter') ? '12px' : '11px'
      });
      
      // 恢复相关节点和边的样式
      const connectedEdges = node.connectedEdges();
      const connectedNodes = node.neighborhood('node');
      
      connectedEdges.style({
        'line-color': '#bdc3c7',
        'target-arrow-color': '#bdc3c7',
        'width': 2
      });
      
      connectedNodes.style({
        'border-width': '0'
      });
    });

    // 自适应布局
    this.cy.fit(undefined, 50);
    
    // 添加缩放控制
    this.cy.userZoomingEnabled(true);
    this.cy.userPanningEnabled(true);
  }

  private generateElements() {
    const elements: any = {
      nodes: [],
      edges: []
    };

    // 添加课程节点
    elements.nodes.push({
      data: { id: 'course', label: this.course.title, type: 'course' },
      classes: 'course',
      position: { x: 0, y: 0 }
    });

    // 为每个章节创建节点并添加相互连接
    this.course.path.forEach((chapter: string, index: number) => {
      const chapterId = `chapter${index}`;
      elements.nodes.push({
        data: { id: chapterId, label: chapter, type: 'chapter' },
        classes: 'chapter'
      });
      
      // 连接课程和章节
      elements.edges.push({
        data: { source: 'course', target: chapterId }
      });

      // 章节之间的相互连接
      if (index > 0) {
        elements.edges.push({
          data: { source: `chapter${index-1}`, target: chapterId }
        });
      }

      // 为每个章节添加相关知识点
      const topicsCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < topicsCount; i++) {
        const topicId = `${chapterId}_topic${i}`;
        const topicLabel = `知识点 ${i + 1}`;
        elements.nodes.push({
          data: { id: topicId, label: topicLabel, type: 'topic' },
          classes: 'topic'
        });
        
        // 连接章节和知识点
        elements.edges.push({
          data: { source: chapterId, target: topicId }
        });
        
        // 随机连接知识点之间的关系
        if (i > 0 && Math.random() > 0.5) {
          elements.edges.push({
            data: { 
              source: `${chapterId}_topic${i-1}`, 
              target: topicId 
            }
          });
        }
      }
    });

    return elements;
  }
}
