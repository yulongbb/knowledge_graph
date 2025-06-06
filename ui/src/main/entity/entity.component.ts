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
  XDialogService,
  XPlace,
  XPosition,
  XRadioNode,
  XGuid,
} from '@ng-nest/ui';
import { EntityService } from './entity.service';
import { EsService } from '../start/search/es.service';
import { OntologyService } from '../ontology/ontology/ontology.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-entity',

  templateUrl: 'entity.component.html',
  styleUrls: ['./entity.component.scss'],
})
export class EntityComponent extends PageBase {
  @ViewChild('tableCom') tableCom!: XTableComponent;

  id: any;
  knowledge: any;
  keyword = '';
  size = 20;
  index = 1;
  value: XPosition = 'right';
  data: any;
  checkedRows: XTableRow[] = [];
  columns: XTableColumn[] = [
    { id: 'checked', label: '', rowChecked: false, headChecked: true, type: 'checkbox', width: 60 },
    { id: 'actions', label: '操作', width: 100, right: 0 },
    { id: '_id', label: '序号', width: 100, left: 0, },
    { id: 'type', label: '类型', width: 100, sort: true },
    { id: 'label', label: '标签', flex: 0.5, sort: true },
    { id: 'description', label: '描述', flex: 1.5, sort: true },
    { id: 'aliase', label: '别名', flex: 2 },
  ];
  model1: any;
  layout: XData<XRadioNode> = [
    { label: '列表', icon: 'fto-list' },
    { label: '卡片', icon: 'fto-grid' },
  ];
  mergedEntity: any;
  types: any = signal([]);
  query: any;
  menus: any;
  constructor(
    private service: EntityService,
    private esService: EsService,
    private ontologyService: OntologyService,
    public override indexService: IndexService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private msgBox: XMessageBoxService,

  ) {
    super(indexService);
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      this.data = (index: number, size: number, query: Query) => this.esService
        .searchEntity(index, size, { bool: {} })
        .pipe(
          tap((data: any) => {
            console.log(data)
            let menu: any = []
            let arr: any = [];
            data.types.forEach((m: any) => {
              arr.push(this.ontologyService.get(m.key));
            })
            forkJoin(arr).subscribe((properties: any) => {
              console.log(properties)

              data.types.forEach((m: any) => {
                menu.push({ id: m.key, label: properties?.filter((p: any) => p?.id == m.key)[0]?.name })
              })
              let menuMerge = [];
              menuMerge = data.types.map((m: any, index: any) => {
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

  detail(row: XTableRow, column: XTableColumn) {
    this.id = row.id[0].split('/')[1];
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
      this.query = {
        must: [
          {
            match: {
              'labels.zh.value': {
                query: keyword,
                operator: 'and',
              },
            },
          },
        ],
      };
    } else {
      this.query = {}
    }
    this.data = (index: number, size: number, query: Query) =>
      this.esService.searchEntity(index, this.size, { bool: this.query }).pipe(
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
      this.esService.searchEntity(index, this.size, { bool: this.query }).pipe(
        tap((x: any) => console.log(x)),
        map((x: any) => x)
      );
  }

  getType(type: any) {
    return this.menus?.filter((m: any) => m.key == type)[0].label.split('(')[0];
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        let param = {};
        this.router.navigate([`./${type}`, param], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'import':
        if (this.checkedRows.length === 0) {
          this.message.warning('请先选择需要批量处理的实体');
          return;
        }
        
        const batchTask = {
          id: uuidv4(), // 生成唯一的任务ID
          type: 'entity-batch',
          entities: this.checkedRows.map(row => row['_id']),
          createdBy: 'current-user', // 这里应该获取当前用户ID
          description: '实体批量处理任务'
        };
        
        // 将批处理任务保存到Redis或后端存储
        this.service.createBatchTask(batchTask).subscribe(
          (result) => {
            this.message.success(`批处理任务已创建，任务ID: ${result.data.id}`);
            // 不再自动跳转，而是显示任务ID供用户参考
          },
          (error) => {
            this.message.error('创建批处理任务失败');
            console.error('Error creating batch task:', error);
          }
        );
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
                console.log(item);
                this.service.deleteItem(item['_id']).subscribe(() => {
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
                this.service.deleteItem(item['_id']).subscribe((data) => {
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
        // this.service.restore(this.checkedRows[0]).subscribe((data: any) => { console.log(data) });
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
      // this.fusionService.fusion(this.mergedEntity).subscribe((data: any) => { console.log(data) });
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