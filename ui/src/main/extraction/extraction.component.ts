import { PageBase } from 'src/share/base/base-page';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { XMessageService } from '@ng-nest/ui/message';
import { IndexService } from 'src/layout/index/index.service';
import { XGuid, XMessageBoxAction, XMessageBoxService, XQuery, XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow, XTransferNode } from '@ng-nest/ui';
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
  steps = signal(['数据解析', '知识录入', '属性配置']);

  pre() {
    this.activated.update((x) => --x);
  }

  next() {
    this.activated.update((x) => ++x);
  }

  done() { }


  dataset: any;
  datasets = (index: number, size: number, query: any) =>
    this.datasetService.getList(index, size, query).pipe(
      tap((x: any) => console.log(x.list)),
      map((x: any) => x.list)
    );


  value = signal([1, 3, 7]);

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

  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'name', label: '序号', flex: 0.5, left: 0, type: 'index' },
    { id: 'title', label: '操作', width: 100 },
    { id: 'subject', label: '实体', flex: 1, sort: true },
    { id: 'property', label: '属性', flex: 0.5, sort: true },
    { id: 'object', label: '值', flex: 1 },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  model = signal([]);
  checkAllData = signal(['全选']);
  checkAll = signal(false);
  indeterminate = signal(true);

  jobs:any;

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
    private msgBox: XMessageBoxService
  ) {
    super(indexService);
  }

  ngOnInit(): void {
    this.grid = canvasDatagrid();
    this.grid.style.height = '800px';
    this.grid.style.width = '100%';
    this.grid.data = this.data;
    this.datagridContainer.nativeElement.appendChild(this.grid);
    this.nodeService.jobs().subscribe((data:any)=>{
      this.jobs = data;
    })
  }

  change(value: boolean) {
    this.model.set(value ? this.properties.map((x: any) => x) : []);
    this.indeterminate.set(false);
  }

  itemChange(value: string[]) {
    this.checkAll.set(value.length === this.properties.length);
    this.indeterminate.set(value.length > 0 && value.length < this.properties.length);
  }

  selectDataset(value: string) {
    console.log(value);
    this.datasetService.get(value).subscribe((x: any) => {
      this.fetchJson('http://localhost:9000/kgms/' + x.files[0]).then((data: Array<any>) => {
        this.grid.data = data.map(item => {
          const { _id, ...rest } = item; // 解构赋值，排除 _id
          return rest;
        });
        console.log(this.grid.schema)
        this.properties = this.grid.schema.map((p: any) => p.name);
      }).catch(error => {
        console.error('Error fetching JSON:', error);
      });
    });
  }

  async fetchJson(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text(); // 获取整个文件的文本内容
      const lines = text.split('\n').filter(line => line.trim() !== ''); // 按行分割，并去除空行

      return lines.map(line => JSON.parse(line)); // 解析每一行作为一个独立的JSON对象
    } catch (error) {
      console.error('Failed to fetch or parse JSONL:', error);
      throw error;
    }
  }

  import() {

    let props = this.model().filter((p: string) => [
      this.label?.name,
      this.description?.name,
      this.aliase?.name,
      this.category?.name,
      this.tags?.name,
      this.images?.name,
    ].indexOf(p) < 0)
    console.log(props);
    // let link = {
    //   "mainsnak": {
    //     "snaktype": "value",
    //     "property": "P31",
    //     "datavalue": {
    //       "value": {
    //         "entity-type": "item",
    //         "numeric-id": 52288878,
    //         "id": "52288878"
    //       },
    //       "type": "wikibase-entityid"
    //     },
    //     "datatype": "wikibase-item"
    //   },
    //   "type": "statement",
    //   "rank": "normal"
    // }

    let data: any = []
    this.grid.data.forEach((row: any) => {
      let entity: any = {};
      if (this.label?.name) {
        if (row[this.label.name] != '') {
          entity["labels"] = {
            "zh": {
              "language": "zh",
              "value": row[this.label.name]
            }
          };
        }

      }
      if (this.description?.name) {
        if (row[this.description.name] != '') {
          entity["descriptions"] = {
            "zh": {
              "language": "zh",
              "value": row[this.description.name]
            }
          };
        }

      }
      if (this.aliase?.name) {
        if (row[this.aliase.name] != '') {
          entity["aliases"] = {
            "zh": [
              {
                "language": "zh",
                "value": row[this.aliase.name]
              }
            ]
          };
        }
      }
      if (this.category?.name) {
        if (row[this.category.name] != '') {
          entity["category"] = row[this.category.name]
        }
      }
      if (this.category?.name) {
        if (row[this.category.name] != '') {
          entity["type"] = row[this.category.name]
        }
      }
      entity["tags"] = []
      this.tags?.forEach((tag: any) => {
        if (tag.name) {
          if (row[tag.name] != '') {
            entity["tags"].push(row[tag.name])
          }
        }
      });

      if (this.images?.name) {
        if (row[this.images.name] != '') {
          entity["images"] = [row[this.images.name]]
        }
      }
      entity['claims'] = {}
      props.forEach((prop: any) => {
        if (row[prop]) {
          entity['claims'][prop] = [];
          entity['claims'][prop].push(
            {
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
            }
          )
        }

      })
      console.log(entity)
      data.push(entity)
    });

    this.nodeService.import(data).subscribe((res: any) => {
      console.log(res)
    })


  }
}
