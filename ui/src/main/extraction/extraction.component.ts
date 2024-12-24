import { PageBase } from 'src/share/base/base-page';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XDialogService, XGuid, XMessageBoxAction, XMessageBoxService, XPlace, XQuery, XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow, XTransferNode } from '@ng-nest/ui';
import { ExtractionService } from './extraction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { PropertyService } from '../ontology/property/property.service';
import { EsService } from '../search/es.service';
import { EntityService } from 'src/main/entity/entity.service';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DatasetService } from '../dataset/dataset.sevice';
declare const canvasDatagrid: any;

@Component({
  selector: 'app-extraction',
  templateUrl: 'extraction.component.html',
  styleUrls: ['./extraction.component.scss'],
})
export class ExtractionComponent extends PageBase {
  grid: any;
  @ViewChild('datagridContainer', { static: true }) datagridContainer!: ElementRef;

  data = [];
  type: any;
  index = 1;
  keyword: any = '';
  query: XQuery = { filter: [] };
  properties: any;
  properties2: any = signal([]);
  items: any = signal([]);
  activated = signal(0);
  datasets = (index: number, size: number, query: any) =>
    this.datasetService.getList(index, size, query).pipe(
      tap((x: any) => console.log(x.list)),
      map((x: any) => x.list)
    );
  dataset: any;
  tableColumns = signal<XTableColumn[]>([
    { id: 'id', label: '序号', type: 'index', width: 80 },
    { id: 'name', label: '用户', flex: 1, sort: true },
  ]);
  label: any;
  description: any;
  aliase: any;
  category: any;
  tags: any;
  images: any;
  checkedRows: XTableRow[] = [];

  @ViewChild('tableCom') tableCom!: XTableComponent;
  model = signal([]);
  ;
  jobs: any;

  constructor(
    public override indexService: IndexService,
    private ontologyService: OntologyService,
    private datasetService: DatasetService,
    private service: ExtractionService,
    private propertyService: PropertyService,
    private esService: EsService,
    private nodeService: EntityService,
    private message: XMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private msgBox: XMessageBoxService,
    private dialogService: XDialogService,

  ) {
    super(indexService);
  }

  ngOnInit(): void {
    this.setupGrid();
    this.fetchJobs();
  }



  // 初始化网格组件
  setupGrid() {
    this.grid = canvasDatagrid();
    this.grid.style.height = '1100px';
    this.grid.style.width = '10000px'; // 设置一个足够大的宽度以启用水平滚动
    this.grid.style.overflowX = 'auto'; // 添加水平滚动条
    this.grid.style.whiteSpace = 'nowrap'; // 防止内容换行
    this.grid.data = this.data;
    this.optimizeGridStyles();
    this.datagridContainer.nativeElement.appendChild(this.grid);
  }
  // 优化网格样式
  optimizeGridStyles() {
    this.grid.style.border = '1px solid #ccc';
    this.grid.style.fontFamily = 'Arial, sans-serif';
    this.grid.style.fontSize = '14px';
    this.grid.style.backgroundColor = '#f9f9f9';
    this.grid.style.color = '#333';
    this.grid.style.borderRadius = '4px';
    this.grid.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  }

  // 从节点服务加载作业
  fetchJobs() {
    this.nodeService.jobs().subscribe((data: any) => {
      this.jobs = data;
    });
  }



  // 选择数据集并加载其数据
  selectDataset(value: string) {
    this.datasetService.get(value).subscribe((dataset: any) => {
      this.loadDataset(dataset.files[0]);
    });
  }

  // 从文件加载数据集数据
  loadDataset(file: string) {
    this.fetchJson(`http://localhost:9000/kgms/${file}`).then((data: Array<any>) => {
      this.grid.data = data.map(({ _id, ...rest }) => rest);
      this.properties = this.grid.schema.map((p: any) => p.name);
    }).catch(error => {
      console.error('Error fetching JSON:', error);
    });
  }

  // 从URL获取JSON数据
  async fetchJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      console.error('Failed to fetch or parse JSONL:', error);
      throw error;
    }
  }

  // 将数据导入节点服务
  importData() {
    const props = this.getFilteredProperties();

    const data = this.grid.data.map((row: any) => this.createEntity(row, props));

    this.nodeService.import(data).subscribe((res: any) => {
      console.log(res);
    });
  }





  // 获取过滤后的属性
  getFilteredProperties() {
    console.log(this.tags)
    console.log(this.images)
    return this.grid.schema.filter((p: any) => ![
      this.label?.name,
      this.description?.name,
      this.aliase?.name,
      this.category?.name,
      this.images?.name,
    ].concat(this.tags?.map((t: any) => t.name)).includes(p.name)).map((p: any) => p.name);
  }

  // 从数据行创建实体
  createEntity(row: any, props: string[]) {
    const entity: any = {};
    this.addBasicProperties(entity, row);
    this.addTags(entity, row);
    this.addClaims(entity, row, props);
    return entity;
  }

  // 向实体添加基本属性
  addBasicProperties(entity: any, row: any) {
    if (this.label?.name && row[this.label.name]) {
      entity["labels"] = { "zh": { "language": "zh", "value": row[this.label.name] } };
    }
    if (this.description?.name && row[this.description.name]) {
      entity["descriptions"] = { "zh": { "language": "zh", "value": row[this.description.name] } };
    }
    if (this.aliase?.name && row[this.aliase.name]) {
      entity["aliases"] = { "zh": [{ "language": "zh", "value": row[this.aliase.name] }] };
    }
    if (this.category?.name && row[this.category.name]) {
      entity["category"] = row[this.category.name];
      entity["type"] = row[this.category.name];
    }
    if (this.images?.name && row[this.images.name]) {
      entity["images"] = [row[this.images.name]];
    }
  }

  // 向实体添加标签
  addTags(entity: any, row: any) {
    entity["tags"] = [];
    this.tags?.forEach((tag: any) => {
      if (tag.name && row[tag.name]) {
        entity["tags"].push(row[tag.name]);
      }
    });
  }

  // 向实体添加声明
  addClaims(entity: any, row: any, props: string[]) {
    entity['claims'] = {};
    props.forEach((prop: any) => {
      if (row[prop]) {
        entity['claims'][prop] = [{
          "mainsnak": {
            "snaktype": "value",
            "property": prop,
            "datavalue": {
              "value": row[prop],
              "type": "wikibase-entityid"
            },
            "datatype": "wikibase-item"
          },
          "type": "statement",
          "rank": "normal"
        }];
      }
    });
  }
}
