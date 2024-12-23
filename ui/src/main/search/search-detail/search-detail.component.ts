import { ChangeDetectionStrategy, Component, Input, OnInit, Query, Signal, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XGuid } from '@ng-nest/ui/core';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import { XDialogService, XImagePreviewComponent, XTableColumn } from '@ng-nest/ui';
import { map } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from '../es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { NavService } from 'src/services/nav.service';
import { EntityService } from 'src/main/entity/entity.service';
import { Statement } from '@angular/compiler';
import { latLng, Marker, marker, tileLayer } from 'leaflet';
import { QualifiesDialogComponent } from 'src/main/entity/qualifies/qualifies.component';
import { TagService } from 'src/main/ontology/tag/tag.sevice';
import * as L from 'leaflet';

@Component({
  selector: 'app-search-detail',
  templateUrl: './search-detail.component.html',
  styleUrls: ['./search-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDetailComponent implements OnInit {
  id: string = '';
  knowledge: string = '';
  type: string = '';
  schema: string = '';
  item: any;

  @ViewChild('form') form!: XFormComponent;
  @ViewChild('form2') form2!: XFormComponent;
  controls: XControl[] = [
    {
      control: 'input',
      id: '_key',
      label: 'ID',
      required: false,
    },
    {
      control: 'input',
      id: 'label',
      label: '标签',
      required: true,
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
      control: 'textarea',
      id: 'description',
      label: '描述',
      required: true,
    },

  ];

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

  imgs: any;

  tags: Map<string, Array<string>> | undefined;

  tag: any = signal([]);
  images: any;
  videos: any;
  pdfs: any;
  entity: any;
  claims: any;

  properties: any;
  propertyData: Signal<any[]> = signal([]);

  statements: any;


  columns2: XTableColumn[] = [
    { id: 'index', label: '序号', width: 40, left: 0, type: 'index' },
    { id: 'property', label: '属性名', flex: 1 },
    { id: 'name', label: '属性值', flex: 1 },
    { id: 'qualify', label: '限定', width: 80 },
    { id: 'actions', label: '操作', width: 100 },
  ];

  options = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', { noWrap: true, maxZoom: 5, minZoom: 1, attribution: '...' })
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909)
  };
  // 用于存储所有标记
  markers: Marker[] = [];

  // 地图点击事件处理函数
  onMapClick(event: any) {
    const { lat, lng } = event.latlng;
    const newMarker = marker([lat, lng]);

    // 添加新的标记到标记数组
    this.markers = [newMarker];
    this.item.location = { "lat": lat, "lon": lng };
    console.log(`当前坐标：纬度 ${lat}, 经度 ${lng}`);
  }

  onMapReady(map: any) {
    // 设置拖动边界（限制地图范围）
    const southWest = latLng(-90, -180); // 西南角坐标
    const northEast = latLng(90, 180); // 东北角坐标
    const bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
    map.fitBounds(bounds)

  }

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private dialogService: XDialogService,
    public nav: NavService,
    private ontologyService: OntologyService,
    private esService: EsService,
    public propertyService: PropertyService,
    public tagService: TagService,
    private nodeService: EntityService,
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
    });
  }

  ngOnInit(): void {

    this.action(this.type);
  }


  add() {
    this.statements = [
      ...this.statements,
      {
        _from: this.item.items[0],

        mainsnak: {
          snaktype: 'value',
          property: '',
          hash: '8f7599319c8f07055134a500cf67fc22d1b3142d',
          datavalue: {
            value: '',
            type: 'string',
          },
          datatype: 'string',
        },
        type: 'statement',
        rank: 'normal',
      },
    ];
  }

  save(row: any) {
    if (row.mainsnak.datavalue.type != 'wikibase-entityid') {
      row['_to'] = this.item.items[0]
    }
    if (row._key) {
      // 更新
      this.nodeService.updateEdge(row).subscribe(() => {
        this.message.success('更新成功！');
      })
    } else {
      // 新增
      this.nodeService.addEdge(row).subscribe((data) => {
        console.log(data);
        const index = this.statements.findIndex((x: any) => x.id === row.id);
        this.statements[index]['_key'] = data['_key'];
        this.message.success('新增成功！');
      })
    }



  }

  del(row: any) {
    console.log(row);
    const index = this.statements.findIndex((x: any) => x.id === row.id);
    if (index >= 0) {
      this.statements.splice(index, 1);
    }
    this.nodeService.deleteEdge(row._key).subscribe(() => {

      this.message.success('删除成功！');
    })
  }

  dialog(row: any) {
    this.dialogService.create(QualifiesDialogComponent, {
      draggable: true,
      resizable: true,
      data: row
    });
  }


  preview(image: any) {
    let img;
    // 检查 imagePath 是否已经是完整的 URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      img = image;
    } else {
      // 如果不是完整的 URL，则添加前缀
      img = 'http://localhost:9000/kgms/' + image;
    }
    this.dialogService.create(XImagePreviewComponent, {
      width: '100%',
      height: '100%',
      className: 'x-image-preview-portal',
      data: [
        {
          src: img,
        },
      ],
    });
  }

  change(statements: any) {
    statements.mainsnak.datatype = this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].type;
    switch (statements.mainsnak.datatype) {
      case 'commonsMedia':
      case 'external-id':
      case 'string':
      case 'url':
      case 'math':
      case 'monolingualtext':
      case 'musical-notation':
        statements.mainsnak.property = `P${this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].id}`
        statements.mainsnak.datavalue = {
          value: '',
          type: 'string',
        }
        break;
      case 'globe-coordinate':
        statements.mainsnak.property = `P${this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].id}`
        statements.mainsnak.datavalue = {
          value: {
            latitude: 0,
            longitude: 0,
            altitude: null,
            precision: 0,
            globe: 'http://www.wikidata.org/entity/Q2', // Default to Earth
          },
          type: 'globecoordinate',
        }
        break;

      case 'quantity':
        statements.mainsnak.property = `P${this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].id}`
        statements.mainsnak.datavalue = {
          value: {
            amount: 0,
            unit: '1',
            upperBound: null,
            lowerBound: null,
          },
          type: 'quantity',
        }
        break;
      case 'time':
        statements.mainsnak.property = `P${this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].id}`
        statements.mainsnak.datavalue = {
          value: {
            time: '',
            timezone: 0,
            before: 0,
            after: 0,
            precision: 0,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727', // Default to Gregorian calendar
          },
          type: 'time'
        }
        break;
      case 'wikibase-item':
      case 'wikibase-property':
      case 'wikibase-lexeme':
      case 'wikibase-form':
      case 'wikibase-sense':
        statements.mainsnak.property = `P${this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].id}`
        statements.mainsnak.datavalue = {
          value: {
            'entity-type': statements.mainsnak.datatype.replace('wikibase-', ''),
            'numeric-id': 0,
            id: '',
          },
          type: 'wikibase-entityid'
        }
        break;
    }

    statements.mainsnak.property = `P${this.propertyData().filter((p: any) => p.name == statements.mainsnak.label)[0].id}`
    console.log(statements);
  }

  uploadSuccess($event: any) {
    console.log(this.imgs);
    if (!this.form.formGroup.value.label) {
      this.form.formGroup.patchValue({
        label: $event.body.name,
        description: $event.body.name,
      });
    }
    this.imgs[this.imgs.length - 1] = {
      url: `http://localhost:9000/kgms/${$event.body.name}`,
    };
  }

  removeFile(file: any, files: any) {
    console.log(this.imgs);
    console.log(file);
    const index = files.findIndex((x: any) => x === file);
    if (index >= 0) {
      files.splice(index, 1);
    }
    const index2 = this.imgs.findIndex((x: any) => x === file);
    if (index2 >= 0) {
      this.imgs.splice(index2, 1);
    }
  }

  upload($event: any, row: any) {
    row.mainsnak.datavalue.value = $event.body.name;
  }

  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


  action(type: string) {
    switch (type) {
      case 'info':
        this.esService.getEntity(this.id).subscribe((x) => {
          console.log(x)

          this.entity = signal(x);
          this.item = x._source;
          this.tag = signal(this.item?.tags);
       

          console.log(this.item)
          if (this.item.location) {
            const newMarker = marker([this.item.location.lat, this.item.location.lon]);

            // 添加新的标记到标记数组
            this.markers = [newMarker];

          }

          this.ontologyService.get(x._source.type).subscribe((type: any) => {

            if (this.type == 'edit') {
              this.form.formGroup.patchValue({
                _key: x?._id,
                label: this.item?.labels?.zh?.value,
                type: { id: type?.id, label: type?.name },
                description: this.item.descriptions?.zh?.value,
              });
            }
            this.ontologyService
              .getAllParentIds(this.item.type)
              .subscribe((parents: any) => {
                parents.push(this.item.type);
                this.tagService
                  .getList(1, 500, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                    ],
                  })
                  .subscribe((data: any) => {
                    let tags: any = {};
                    data.list.forEach((tag: any) => {
                      tags[tag.type] = tags[tag.type] ?? [];
                      tags[tag.type].push(tag.name);
                    });
                    this.tags = tags;
                  });
                this.propertyService
                  .getList(1, 50, {
                    filter: [
                      {
                        field: 'id',
                        value: parents as string[],
                        relation: 'schemas',
                        operation: 'IN',
                      },
                    ],
                  })
                  .subscribe((x: any) => {
                    console.log(x.list)
                    this.propertyData = signal(x.list);
                    this.properties = x.list.map((p: any) => p.name);
                    this.nodeService
                      .getLinks(1, 50, this.id, {})
                      .subscribe((c: any) => {
                        this.statements = [];
                        c.list.forEach((p: any) => {
                          if (p.edges[0].mainsnak.property != 'P31') {
                            p.edges[0].mainsnak.label = x.list.filter(
                              (p2: any) =>
                                p.edges[0].mainsnak.property == `P${p2.id}`
                            )[0]?.name;
                            if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                              console.log(p.edges[0].mainsnak.property);
                              p.edges[0].mainsnak.datavalue.value.id =
                                p.vertices[1]?.id;
                              p.edges[0].mainsnak.datavalue.value.label =
                                p.vertices[1]?.labels?.zh?.value;
                            }
                            this.statements.push(p.edges[0]);
                          }
                          this.claims = this.statements;
                        });
                      });
                  });
              });
          });
          this.images = x?._source?.images.filter(
            (image: any) =>
              image?.split('.')[image.split('.').length - 1] != 'mp4' &&
              image?.split('.')[image.split('.').length - 1] != 'pdf'
          );
          this.videos = x?._source?.images.filter(
            (image: any) =>
              image?.split('.')[image.split('.').length - 1] == 'mp4'
          );
          this.pdfs = x?._source?.images.filter(
            (image: any) =>
              image?.split('.')[image.split('.').length - 1] == 'pdf'
          );
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        console.log(this.tag());
        let item: any = {
          _key: this.form.formGroup.value._key,
          tags: this.tag(),
          labels: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.label,
            },
          },
          descriptions: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.description,
            },
          },
          type: this.form.formGroup.value.type,
          images: this.imgs?.map(
            (i: any) => i.url.split('/')[i.url.split('/').length - 1]
          ),
          location: this.item?.location
        };
        console.log(item)
        if (this.type === 'add') {
          this.nodeService.post(item).subscribe((x) => {
            this.message.success('新增成功！');
            this.router.navigate(['/index/entity']);
          });
        } else if (this.type === 'edit') {
          this.nodeService.getLinks(1, 20, this.id, {}).subscribe((c: any) => {
            let statements: any = [];
            c.list.forEach((p: any) => {
              p.edges[0].state = 'info';
              if (p.edges[0]['_from'] != p.edges[0]['_to']) {
                p.edges[0].mainsnak.datavalue.value.id = p.vertices[1].id;
                p.edges[0].mainsnak.datavalue.value.label =
                  p.vertices[1].labels.zh.value;
              }
              statements.push(p.edges[0]);
            });
          });
          item.id = this.id;
          item['_key'] = this.item.items[0].split('/')[1];
          item['items'] = this.item.items;
          this.nodeService.put(item).subscribe((x) => {
            this.message.success('编辑成功！');
            this.router.navigate(['/index/entity']);
          });
        }
        break;
      case 'cancel':
        this.router.navigate(['/index/entity']);
        break;
    }
  }

  linkifyText(text: string, entities: any): string {
    const wikidataBaseUrl = 'http://localhost:4200/index/search/info/';
    let entityMap: any = new Map();
    entities.forEach((entity: any) => {
      entityMap[entity.word] = entity.id;
    });
    Object.keys(entityMap).forEach((key) => {
      const link = `<a href="${wikidataBaseUrl}${entityMap[key]}" >${key}</a>`;
      text = text.replace(new RegExp(key, 'g'), link);
    });
    return text;
  }

  getStatement(property: any): any {
    return this.claims?.filter(
      (c: any) => c.mainsnak.property == `P${property.id}`
    );
  }

  // 在你的组件类中添加此方法
  getFullImageUrl(imagePath: string): string {
    // 检查 imagePath 是否已经是完整的 URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    } else {
      // 如果不是完整的 URL，则添加前缀
      return 'http://localhost:9000/kgms/' + imagePath;
    }
  }

  back() {
    this.nav.back();
  }

  close($event: string | number) {
    console.log(this.tag);
    this.tag.update((x: any) => {
      x.splice(x.indexOf($event), 1);
      return [...x];
    });
  }
}

interface Datavalue {
  value: any;
  type: string;
}
