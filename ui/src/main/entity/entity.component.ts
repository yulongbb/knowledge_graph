import { PageBase } from 'src/share/base/base-page';
import { Component, ViewChild, signal } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import { XTableColumn, XTableComponent, XTableHeadCheckbox, XTableRow } from '@ng-nest/ui/table';
import { tap, map, Observable, forkJoin } from 'rxjs';
import { Query } from 'src/services/repository.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  XData,
  XMessageBoxAction,
  XMessageBoxService,
  XMessageService,
  XPlace,
  XPosition,
  XRadioNode,
} from '@ng-nest/ui';
import { FusionService } from '../fusion/fusion.service';
import { EntityService } from './entity.service';
import { EsService } from '../search/es.service';
import { OntologyService } from '../ontology/ontology/ontology.service';

@Component({
  selector: 'app-entity',

  templateUrl: 'entity.component.html',
  styleUrls: ['./entity.component.scss'],
})
export class EntityComponent extends PageBase {
  id: any;
  knowledge: any;
  keyword = '';
  size = 20;
  index = 1;

  value: XPosition = 'right';


  detail(row: XTableRow, column: XTableColumn) {
    this.id = row.id[0].split('/')[1];
  }

  data: any;

  checkedRows: XTableRow[] = [];

  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'actions', label: '操作', width: 150, right: 0 },
    { id: '_id', label: '序号', width: 100, left: 0, },
    { id: 'type', label: '类型', width: 100, sort: true },
    { id: 'label', label: '标签', flex: 0.5, sort: true },
    { id: 'description', label: '描述', flex: 1.5, sort: true },
    { id: 'aliase', label: '别名', flex: 2 },
  ];

  @ViewChild('tableCom') tableCom!: XTableComponent;
  model1: any;

  layout: XData<XRadioNode> = [
    { label: '列表', icon: 'fto-list' },
    { label: '卡片', icon: 'fto-grid' },
  ];

  mergedEntity: any;
  types: any = signal([]);
  query: any;
  menus:any;
  constructor(
    private service: EntityService,
    private esService: EsService,
    private fusionService: FusionService,
    private ontologyService: OntologyService,
    public override indexService: IndexService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private msgBox: XMessageBoxService
  ) {

    super(indexService);
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.data = (index: number, size: number, query: Query) => this.esService
        .searchEntity(index, size, {})
        .pipe(
          tap((data: any) => {
            let menu: any = []
            let arr: any = [];
            data.aggregations.forEach((m: any) => {
              arr.push(this.ontologyService.get(m.key));
            })
            forkJoin(arr).subscribe((properties: any) => {
              data.aggregations.forEach((m: any) => {
                menu.push({ id: m.key, label: properties.filter((p: any) => p.id == m.key)[0].name })
              })
              let menuMerge = [];
              menuMerge = data.aggregations.map((m: any, index: any) => {
                return { ...m, ...menu[index] }
              })
              menuMerge.forEach((m: any) => {
                m.label = m.label + '(' + m.doc_count + ')';
              })
              menuMerge.unshift({ id: '', label: '全部（' + data.total + ')' });
              this.menus = menuMerge
              this.types = signal(menuMerge)
              console.log(menuMerge)
            });
          }),
          map((x: any) => x)
        );

    });
  }

  setCheckedRows(checked: boolean, row: XTableRow) {
    if (checked) {
      if (!this.checkedRows.some((x) => x.id === row.id)) {
        this.checkedRows.push(row);
      }
    } else {
      if (this.checkedRows.some((x) => x.id === row.id)) {
        let index = this.checkedRows.findIndex((x) => x.id === row.id);
        this.checkedRows.splice(index, 1);
      }
    }
  }

  headCheckboxChange(headCheckbox: XTableHeadCheckbox) {
    const checked = headCheckbox.checkbox['checked'];
    for (let row of headCheckbox.rows) {
      this.setCheckedRows(checked, row);
    }
  }

  bodyCheckboxChange(row: XTableRow) {
    this.setCheckedRows(row['checked'], row);
  }


  search(keyword: any) {
    if (keyword != '') {
      this.query = { "must": [{ "match": { "labels.zh.value": keyword } }, { "match": { "descriptions.zh.value": keyword } }] }
    } else {
      this.query = {}
    }
    this.data = (index: number, size: number, query: Query) =>
      this.esService.searchEntity(index, this.size, this.query).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  selectType(type: any) {
    if (type.id) {
      this.query = { "must": [{ "term": { "type.keyword": type.id } }] }
    } else {
      this.query = {}
    }
    this.data = (index: number, size: number, query: Query) =>
      this.esService.searchEntity(index, this.size, this.query).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  getType(type:any){
    return this.menus.filter((m:any)=> m.key == type)[0].label.split('(')[0];
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        let param = {};
        this.router.navigate([`./${type}`, param], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'info':
        console.log(item);
        this.router.navigate(
          [`./${type}/${item._id}`],
          {
            relativeTo: this.activatedRoute,
          }
        ).then(() => {
        });
        break;
      case 'edit':
        this.router.navigate(
          [`./${type}/${item._id}`],
          {
            relativeTo: this.activatedRoute,
          }
        );
        break;
      case 'delete':
        if (this.checkedRows.length > 0) {
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除${this.checkedRows.length}关系，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              action === 'confirm' && this.checkedRows.forEach((item) => {
                this.service.delete(item['_id']).subscribe(() => {
                  this.tableCom.change(this.index);
                  this.message.success('删除成功！');
                });
              })
            },
          });
        } else {
          this.msgBox.confirm({
            title: '提示',
            content: `此操作将永久删除此条数据，是否继续？`,
            type: 'warning',
            callback: (action: XMessageBoxAction) => {
              action === 'confirm' &&
                this.service.delete(item['_id']).subscribe((data) => {
                  console.log(data);
                  this.tableCom.change(this.index);
                  this.message.success('删除成功！');
                });
            },
          });
        }
        break;
      case 'fusion':
        this.placement.set('center');
        this.visible = true;
        console.log(this.checkedRows)
        let checkedRows: EntitySource[] = [];
        this.checkedRows.forEach((row: any) => {
          checkedRows.push(row['_source'])
        })
        this.mergedEntity = this.fusion(checkedRows);
        break;
      case 'restore':
        this.fusionService.restore(this.checkedRows[0]).subscribe((data: any) => { console.log(data) });
        break;
    }
  }



  visible = false;
  placement = signal<XPlace>('center');



  close() {
    this.visible = false;
  }

  evt(type: string) {
    console.log('output', type);
    if (type == 'confirm') {
      this.fusionService.fusion(this.mergedEntity).subscribe((data: any) => { console.log(data) });
    }
  }

  fusion(checkedRows: EntitySource[]): EntitySource {
    // 初始化标签、描述和别名
    let mergedType: string = "";
    let mainLabel: Label | null = null;
    let mergedDescription: string = "";
    let mergedAliases: Alias[] = [];
    let mergedItems: string[] = [];
    let latestModified: string = "";

    // 遍历每个实体进行融合
    for (let row of checkedRows) {
      const { type, labels, descriptions, aliases, modified, items }: any = row;
      // 合并描述
      if (type) {
        mergedType = type;
      }

      // 如果 mainLabel 还没有设置，选择第一个标签作为主要标签
      if (!mainLabel) {
        mainLabel = labels?.zh;
      } else {
        // 如果已经有了主要标签，当前标签进入别名
        mergedAliases.push({
          language: labels?.zh?.language,
          value: labels?.zh?.value
        });
      }

      // 合并描述
      if (descriptions?.zh) {
        if (mergedDescription) {
          mergedDescription += `，${descriptions?.zh?.value}`;
        } else {
          mergedDescription = descriptions?.zh?.value;
        }
      }

      // 合并别名
      if (aliases && aliases.zh) {
        for (let alias of aliases.zh) {
          if (!mergedAliases.some(a => a.value === alias.value)) {
            mergedAliases.push(alias);
          }
        }
      }

      // 合并items
      mergedItems = [...new Set([...mergedItems, ...items])];

      // 保留最新的modified时间
      if (modified > latestModified) {
        latestModified = modified;
      }
    }

    // 创建最终的合并实体
    const mergedEntity: EntitySource = {
      ids: this.checkedRows.map((row: any) => row['_id']),
      type: mergedType,
      labels: {
        zh: mainLabel!
      },
      descriptions: {
        zh: {
          language: "zh",
          value: mergedDescription
        }
      },
      aliases: {
        zh: mergedAliases
      },
      modified: latestModified,
      items: mergedItems
    };

    console.log(mergedEntity);
    return mergedEntity;
  }

}





interface Label {
  language: string;
  value: string;
}

interface Description {
  language: string;
  value: string;
}

interface Alias {
  language: string;
  value: string;
}

interface EntitySource {
  ids: string[];
  type: string;
  labels: {
    [key: string]: Label;
  };
  descriptions: {
    [key: string]: Description;
  };
  aliases?: {
    [key: string]: Alias[];
  };
  modified: string;
  items: string[];
}