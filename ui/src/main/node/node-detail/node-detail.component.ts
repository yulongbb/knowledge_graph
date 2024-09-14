import { ChangeDetectionStrategy, Component, ElementRef, OnInit, Query, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { NodeService } from '../node.service';
import { XTableColumn } from '@ng-nest/ui';
import { map, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-node-detail',
  templateUrl: './node-detail.component.html',
  styleUrls: ['./node-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeDetailComponent implements OnInit {
  id: string = '';
  type: string = '';
  @ViewChild('form') form!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'input',
      id: 'label',
      label: '标签',
      required: true,

      // pattern: /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/,
      // message: '邮箱格式不正确，admin@ngnest.com'
    },
    {
      control: 'input',
      id: 'type',
      label: '类型',
      value: 'item',
      disabled: true
    },
    {
      control: 'input',
      id: 'description',
      label: '描述',
      required: true,
      // pattern: /^((\+?86)|(\(\+86\)))?1\d{10}$/,
      // message: '手机号格式不正确，+8615212345678'
    },
    { control: 'input', id: 'id', hidden: true, value: XGuid() }
  ];

  data: any;
  size = 20;
  query: any;


  columns: XTableColumn[] = [
    { id: 'index', label: '序号', width: 85, left: 0, type: 'index' },
    { id: 'property', label: '属性名', width: 200 },
    { id: 'value', label: '值', flex: 1 },
  ];

  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;

  @ViewChild('cy', { static: true }) cyContainer!: ElementRef;


  constructor(
    private nodeService: NodeService,
    private ontologyService: OntologyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService
  ) {
    // 获取路由参数
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.id = x.get('id') as string;
      this.type = x.get('type') as string;
      if (this.type === 'info') {
        this.title = '查看实体';
        this.disabled = true;
      } else if (this.type === 'add') {
        this.title = '新增实体';
      } else if (this.type === 'update') {
        this.title = '修改实体';
      }
      this.nodeService.getLinks(1, 50, this.id, {}).subscribe((data: any) => {
        console.log(data);
        this.initializeCytoscape(data);
      });

    });
  }

  ngOnInit(): void {


    this.action(this.type);
  }

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
        this.id = target.data().id.split('/')[1];
        this.action(this.type);

      }else if(target.isEdge()){
        console.log("点击边")
      }
    })
  }

  uploadSuccess($event: any) {
    let item: any = {};
    item['label'] = $event.body.name;
    this.form.formGroup.patchValue(item);
    console.log('uploadSuccess', $event);
  }


  action(type: string) {
    switch (type) {
      case 'info':
        this.nodeService.getItem(this.id).subscribe((x) => {
          console.log(x)
          let item: any = {};
          item['id'] = x._id;
          // item['type'] = x?.type;
          //创建边
          item['label'] = x?.labels?.zh?.value;
          item['description'] = x?.descriptions?.zh?.value;
          this.form.formGroup.patchValue(item);
          this.data = (index: number, size: number, id: string, query: Query) =>
            this.nodeService.getLinks(index, this.size, this.id, this.query).pipe(
              tap((x: any) => console.log(x)),
              map((x: any) => x)
            );
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        if (this.type === 'add') {
          console.log(this.form.formGroup.value)
          this.nodeService.post(this.form.formGroup.value).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/node']);
          });
        } else if (this.type === 'edit') {
          console.log(this.form.formGroup.value)

          this.nodeService.put(this.form.formGroup.value).subscribe((x) => {
            this.message.success('修改成功！');
            this.router.navigate(['/index/node']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/node']);
        break;
    }
  }
}