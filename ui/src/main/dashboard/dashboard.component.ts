import { Component, ElementRef, OnDestroy, OnInit, Query, ViewChild, signal } from '@angular/core';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit, OnDestroy {
 
  ngOnInit(): void {
    this.initializeCytoscape({});
    }
  @ViewChild('cy', { static: true }) cyContainer!: ElementRef;

  initializeCytoscape(data: any): void {
    const cy = cytoscape({
      container: this.cyContainer.nativeElement, // container to render in

      elements: data.elements,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'width': 5,
            'height': 5,
            'background-color': '#666',
            'label': 'data(label)',
            'font-size': '4px',
            'text-valign': 'bottom',

          }
        },
        {
          selector: 'edge',
          style: {
            'width': 0.4,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            "text-opacity": 1,
            "overlay-opacity": 0,
            'arrow-scale': 0.3,

            'label': 'data(label)',
            'font-size': '4px',
            'control-point-weight': 0.5,
            'control-point-distance': 30,

          }
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property': 'background-color, line-color, target-arrow-color',

          }
        }
      ],

      layout: {
        name: 'cose',

      },

      // initial viewport state:
      zoom: 1, // 图表的初始缩放级别.可以设置options.minZoom和options.maxZoom设置缩放级别的限制.
      pan: { x: 0, y: 0 }, // 图表的初始平移位置.

      // interaction options:
      minZoom: 1e-50, // 图表缩放级别的最小界限.视口的缩放比例不能小于此缩放级别.
      maxZoom: 1e50, // 图表缩放级别的最大界限.视口的缩放比例不能大于此缩放级别.
      zoomingEnabled: true, // 是否通过用户事件和编程方式启用缩放图形.
      userZoomingEnabled: true, // 是否允许用户事件(例如鼠标滚轮,捏合缩放)缩放图形.对此缩放的编程更改不受此选项的影响.
      panningEnabled: true, // 是否通过用户事件和编程方式启用平移图形.
      userPanningEnabled: true, // 是否允许用户事件(例如拖动图形背景)平移图形.平移的程序化更改不受此选项的影响.
      boxSelectionEnabled: true, // 是否启用了框选择(即拖动框叠加,并将其释放为选择).如果启用,则用户必须点击以平移图表.
      selectionType: 'single', // 一个字符串，指示用户输入的选择行为.对于'additive',用户进行的新选择将添加到当前所选元素的集合中.对于'single',用户做出的新选择成为当前所选元素的整个集合.
      touchTapThreshold: 8, // 非负整数,分别表示用户在轻击手势期间可以在触摸设备和桌面设备上移动的最大允许距离.这使得用户更容易点击.
      // 这些值具有合理的默认值,因此建议不要更改这些选项,除非您有充分的理由这样做.大值几乎肯定会产生不良后果.
      desktopTapThreshold: 4, // 非负整数,分别表示用户在轻击手势期间可以在触摸设备和桌面设备上移动的最大允许距离.这使得用户更容易点击.
      // 这些值具有合理的默认值,因此建议不要更改这些选项,除非您有充分的理由这样做.大值几乎肯定会产生不良后果.
      autolock: false, // 默认情况下是否应锁定节点(根本不可拖动,如果true覆盖单个节点状态).
      autoungrabify: false, // 默认情况下节点是否不允许被拾取(用户不可抓取,如果true覆盖单个节点状态).
      autounselectify: false, // 默认情况下节点是否允许被选择(不可变选择状态,如果true覆盖单个元素状态).


      // rendering options:
      headless: false, // true:空运行,不显示不需要容器容纳.false:显示需要容器容纳.
      styleEnabled: true, // 一个布尔值,指示是否应用样式.
      hideEdgesOnViewport: false, // 渲染提示,设置为true在渲染窗口时,不渲染边.例如,移动某个顶点时或缩放时,边信息会被临时隐藏,移动结束后,边信息会被执行一次渲染.由于性能增强,此选项现在基本上没有实际意义.
      hideLabelsOnViewport: true, // 渲染提示,当设置为true使渲染器在平移和缩放期间使用纹理而不是绘制元素时,使大图更具响应性.由于性能增强,此选项现在基本上没有实际意义.
      textureOnViewport: true, // 渲染提示,当设置为true使渲染器在平移和缩放期间使用纹理而不是绘制元素时,使大图更具响应性.由于性能增强,此选项现在基本上没有实际意义.
      motionBlur: true, // 渲染提示,设置为true使渲染器使用运动模糊效果使帧之间的过渡看起来更平滑.这可以增加大图的感知性能.由于性能增强,此选项现在基本上没有实际意义.
      motionBlurOpacity: 0.2, // 当motionBlur:true,此值控制运动模糊帧的不透明度.值越高,运动模糊效果越明显.由于性能增强,此选项现在基本上没有实际意义.
      wheelSensitivity: 1, // 缩放时更改滚轮灵敏度.这是一个乘法修饰符.因此,0到1之间的值会降低灵敏度(变焦较慢),而大于1的值会增加灵敏度(变焦更快).
      pixelRatio: 'auto', // 使用手动设置值覆盖屏幕像素比率(1.0建议,如果已设置).这可以通过减少需要渲染的有效区域来提高高密度显示器的性能,
      // 尽管在最近的浏览器版本中这是不太必要的.如果要使用硬件的实际像素比,可以设置pixelRatio: 'auto'(默认).


    });
    cy.on('tap', (ele: any) => {
      var target: any = ele.target;
      if(target==cy){
        console.log("点击空白处")

      }else if(target.isNode()){
        console.log("点击节点")
        console.log(target.data())

      }else if(target.isEdge()){
        console.log("点击边")
      }
    })
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}