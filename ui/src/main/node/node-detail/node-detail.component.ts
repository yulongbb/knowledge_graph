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
      control: 'find',
      id: 'type',
      label: '类型',
      treeData: () =>
        this.ontologyService
          .getList(1, Number.MAX_SAFE_INTEGER, {

            sort: [
              { field: 'pid', value: 'asc' },
              { field: 'sort', value: 'asc' },
            ],
          })
          .pipe(map((x) => x.list)),

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
      this.nodeService.getLinks(1, 50, this.id, {}).subscribe((c: any) => {
        console.log(c);
      });

    });
  }

  ngOnInit(): void {
    this.initializeCytoscape();

    this.action(this.type);
  }

  initializeCytoscape(): void {
    const cy = cytoscape({
      container: this.cyContainer.nativeElement, // container to render in

      elements: [ // list of graph elements to start with
        { // node 1
          data: { id: 'a' }
        },
        { // node 2
          data: { id: 'b' }
        },
        { // edge between node 1 and 2
          data: { id: 'ab', source: 'a', target: 'b' }
        }
      ],

      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],

      layout: {
        name: 'grid',
        rows: 1
      }
    });
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