import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-path-styles-demo',
  template: `
    <div class="demo-container">
      <div #demoDiv style="width: 100%; height: 400px; border: 1px solid #ccc; border-radius: 4px;"></div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
    }
  `]
})
export class PathStylesDemoComponent implements OnInit {
  @ViewChild('demoDiv', { static: true }) private demoRef!: ElementRef;
  private diagram: go.Diagram | null = null;

  private demoPath = [
    '基础知识', '核心概念', '实战技巧', '高级特性', 
    '最佳实践', '性能优化', '项目实践'
  ];

  ngOnInit() {
    this.initializeDiagram();
  }

  private initializeDiagram() {
    const $ = go.GraphObject.make;
    this.diagram = $(go.Diagram, this.demoRef.nativeElement, {
      initialContentAlignment: go.Spot.Center,
      "undoManager.isEnabled": true,
      layout: $(go.LayeredDigraphLayout, { direction: 0 })
    });

    // 节点模板
    this.diagram.nodeTemplate = $(go.Node, "Auto",
      {
        locationSpot: go.Spot.Center
      },
      $(go.Shape, "RoundedRectangle",
        {
          fill: "white",
          strokeWidth: 2,
          stroke: "#4B2E83",
          width: 120,
          height: 40
        }),
      $(go.TextBlock,
        {
          margin: 8,
          font: "bold 12px sans-serif",
          stroke: "#4B2E83"
        },
        new go.Binding("text", "key"))
    );

    // 连接线模板
    this.diagram.linkTemplate = $(go.Link,
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 30,
        adjusting: go.Link.End
      },
      $(go.Shape, 
        { 
          strokeWidth: 2,
          stroke: "#4B2E83"
        }),
      $(go.Shape,
        { 
          toArrow: "Triangle",
          scale: 1.2,
          fill: "#4B2E83",
          stroke: null
        })
    );

    // 创建蜿蜒路径
    const amplitude = 80;  // 波浪高度
    const frequency = 0.8; // 波浪频率
    const spacing = 140;   // 水平间距

    const nodes = this.demoPath.map((step, i) => ({
      key: step,
      loc: new go.Point(
        i * spacing,
        amplitude * Math.sin(i * frequency * Math.PI)
      )
    }));

    const links = this.demoPath.slice(0, -1).map((step, i) => ({
      from: step,
      to: this.demoPath[i + 1]
    }));

    this.diagram.model = new go.GraphLinksModel(nodes, links);

    // 调整视图
    setTimeout(() => {
      if (this.diagram) {
        this.diagram.zoomToFit();
        this.diagram.centerRect(this.diagram.documentBounds);
      }
    }, 100);
  }
}
