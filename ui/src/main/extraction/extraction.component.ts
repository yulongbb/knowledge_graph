import { PageBase } from 'src/share/base/base-page';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XDialogService, XGuid, XMessageBoxAction, XMessageBoxService, XPlace, XQuery, XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow, XTransferNode } from '@ng-nest/ui';
import { ExtractionService } from './extraction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, Observable, Subscription, tap } from 'rxjs';
import { PropertyService } from '../ontology/property/property.service';
import { EsService } from '../start/search/es.service';
import { EntityService } from 'src/main/entity/entity.service';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DatasetService } from '../dataset/dataset.sevice';
import { HttpClient } from '@angular/common/http';
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
    { id: 'name', label: '字段名', flex: 1, sort: true },
  ]);
  label: any;
  description: any;
  category: any;
  url: any;

  aliases: any;
  tags: any;
  images: any;


  checkedRows: XTableRow[] = [];

  @ViewChild('tableCom') tableCom!: XTableComponent;
  model = signal([]);

  latestJob: any = null;
  showProgress: any = false;
  isImporting = false;

  private intervalId: any;
  private subscription: Subscription = new Subscription;

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
    private http: HttpClient
  ) {
    super(indexService);
  }

  ngOnInit(): void {
    this.setupGrid();
  }


  // 初始化网格组件
  setupGrid() {
    this.grid = canvasDatagrid();
    this.grid.style.height = '1100px';
    this.grid.style.width = '10000px'; // 设置一个足够大的宽度以启用水平滚动
    this.grid.style.overflowX = 'auto'; // 添加水平滚动条
    this.grid.style.whiteSpace = 'nowrap'; // 防止内容换行
    // 设置初始列定义
    this.grid.columns = [
      { label: '名称', property: '名称' },
      { label: '描述', property: '描述' },
      { label: '别名', property: '别名' },
      { label: '类型', property: '类型' },
      { label: '标签', property: '标签' },
      { label: '文件', property: '文件' }
    ];
    // 绑定数据到网格，默认加载100条空数据
    // 绑定数据到网格，默认加载100条空数据
    this.grid.data = this.generateDefaultData();    // 自定义上下文菜单
    this.grid.addEventListener('contextmenu', (e: any) => {
      e.items.push({
        title: '添加行',
        click: () => this.addCustomRows(1) // 默认添加一行
      });
      e.items.push({
        title: '添加列',
        click: () => this.addCustomColumn() // 默认添加一行
      });
    });
    this.optimizeGridStyles();
    this.datagridContainer.nativeElement.appendChild(this.grid);
  }

  generateDefaultData(): any[] {
    return Array.from({ length: 10 }, (_, i) => ({
      名称: '',
      描述: '',
      别名: '',
      类型: '',
      标签: '',
      文件: ''
    }));
  }

  addCustomColumn() {
    console.log('请输入新列名');
    const columnName = prompt('请输入新列名');
    if (columnName && columnName.trim()) {
      const lowerColumnName = columnName.toLowerCase();
      // 检查是否已经存在该列
      if (!this.grid.columns?.some((col: any) => col.property === lowerColumnName)) {
        this.grid.addColumn({
          defaultValue: (e: any) => {
            return '';
          },
          title: lowerColumnName,
          name: lowerColumnName,
        });
      } else {
        alert(`列名 "${columnName}" 已经存在`);
      }
    } else {
      alert('列名不能为空');
    }
  }


  addCustomRows(rowCount: number = 1) {
    console.log('请输入有效的行数');

    if (isNaN(rowCount) || rowCount < 1) {
      alert('请输入有效的行数');
      return;
    }

    // 获取当前最大ID
    let maxId = Math.max(...this.grid.data.map((item: any) => item.id), 0);

    console.log(this.grid.columns)

    // 创建新的行数据
    const newData = Array.from({ length: rowCount }, (_, index) => ({
      id: maxId + index + 1,
      ...Object.fromEntries(this.grid.columns.map((col: any) => [col.property, '']))
    }));

    // 将新行添加到现有数据中
    this.grid.data.push(...newData);

    // 刷新表格视图以反映更改
    this.grid.refresh();
    console.log(`Added ${rowCount} rows.`);
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

  startPolling() {
    this.showProgress = true;
    this.intervalId = setInterval(() => this.fetchLatestJob(), 5000); // 每5秒轮询一次
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchLatestJob() {
    this.subscription = this.nodeService.jobs().subscribe(
      (data: any[]) => {
        // 假设作业按照创建时间排序，最新的在最后
        const unfinishedJobs = data.filter(job => job.progress < 100);
        if (unfinishedJobs.length > 0) {
          this.latestJob = unfinishedJobs[unfinishedJobs.length - 1]; // 获取最新的未完成作业
        } else {
          this.showProgress = false; // 如果没有进行中的作业，隐藏进度条并停止轮询
          this.stopPolling();
        }
      },
      (error) => console.error('Error fetching jobs:', error)
    );
  }

  // 选择数据集并加载其数据
  selectDataset(value: string) {
    console.log(value);
    this.datasetService.get(value).subscribe((dataset: any) => {
      console.log(dataset);
      if (dataset.type == '文件') {
        this.loadDataset(dataset.files[0]);

      } else if (dataset.type == 'api') {
        // 获取api数据
        this.loadApiData(dataset);
      }
    });
  }
  loadApiData(dataset: any) {
    // Make the HTTP GET request
    this.http.get<any>(dataset.description).subscribe(
      (apiData: any) => {
        // Define the fields you want to extract

        // Extract and transform the data
        this.grid.data = apiData.sections[0].cards.map((card: any) => {
          // Create a new object with only the required fields
          const transformedCard: any = {};
          dataset.tags.forEach((field: any) => {
            if (card[field] !== undefined) {
              transformedCard[field] = card[field];
            }
          });
          return transformedCard;
        });

        console.log('Transformed Data:', this.grid.data);
      },
      (error: any) => {
        console.error('Error fetching API data:', error);
      }
    );
  }


  // 从文件加载数据集数据
  loadDataset(file: string) {
    this.fetchJson(`http://localhost:9000/kgms/${file}`).then((data: Array<any>) => {
      this.grid.data = data.map(({ _id, ...rest }) => rest);
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
    this.isImporting = true;
    this.showProgress = false; // 确保进度条不立即显示

    // 模拟启动导入任务的过程，实际应用中应替换为真实逻辑
    setTimeout(() => {
      this.fetchLatestJob();
      this.startPolling();
      this.isImporting = false;
    }, 2000); // 假设导入任务需要2秒准备时间
    console.log(this.grid.data)
    const props = this.getFilteredProperties();
    const data = this.grid.data.map((row: any) => this.createEntity(row, props));
    console.log(data)
    this.nodeService.import(data).subscribe((res: any) => {
      console.log(res);
    });
  }


  // 获取过滤后的属性
  getFilteredProperties() {
    return this.grid.schema.filter((p: any) => ![
      this.label?.name,
      this.description?.name,
      this.category?.name,
      this.url?.name,
    ].concat(this.tags?.map((t: any) => t.name))
      .concat(this.aliases?.map((a: any) => a.name))
      .concat(this.images?.map((i: any) => i.name)).includes(p.name)).map((p: any) => p.name);
  }

  // 从数据行创建实体
  createEntity(row: any, props: string[]) {
    const entity: any = {};
    this.addBasicProperties(entity, row);
    this.addTags(entity, row);
    this.addAliases(entity, row);
    this.addImages(entity, row);
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
    if (this.category?.name && row[this.category.name]) {
      entity["category"] = row[this.category.name];
      entity["type"] = row[this.category.name];
    }
    if (this.images?.name && row[this.images.name]) {
      entity["images"] = [row[this.images.name]];
    }
    if (this.url?.name && row[this.url.name]) {
      entity["sources"] = [row[this.url.name]];
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

  // 向实体添加别名
  addAliases(entity: any, row: any) {
    entity["aliases"] = {};
    entity["aliases"]['zh'] = [];
    this.aliases?.forEach((aliase: any) => {
      if (aliase.name && row[aliase.name]) {
        entity["aliases"]['zh'].push({ "language": "zh", "value": row[aliase.name] });
      }
    });
  }


  // 向实体添加文件
  addImages(entity: any, row: any) {
    entity["images"] = [];
    this.images?.forEach((image: any) => {
      if (image.name && row[image.name]) {
        entity["images"].push(row[image.name]);
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
