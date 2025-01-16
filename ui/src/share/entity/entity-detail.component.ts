import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Signal,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import {
  XDialogService,
  XGuid,
  XImagePreviewComponent,
  XTableColumn,
  XTableRow,
  XPlace,
} from '@ng-nest/ui';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EsService } from 'src/main/start/search/es.service';
import { PropertyService } from 'src/main/ontology/property/property.service';
import { TagService } from 'src/main/ontology/tag/tag.sevice';
import { NavService } from 'src/services/nav.service';
import { latLng, marker, Marker, tileLayer } from 'leaflet';
import * as L from 'leaflet';
import { EntityService } from 'src/main/entity/entity.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailComponent implements OnInit, OnChanges {
  @Input() id: string = '';
  @Input() type: string = '';
  knowledge: string = '';
  schema: string = '';
  item: any;
  content = '<p>这是默认内容</p>';
  labels = signal(['用户管理', '配置管理', '角色管理', '任务']);

  @ViewChild('form') form!: XFormComponent;
  @ViewChild('form2') form2!: XFormComponent;



  query: any;


  title = '';
  get formInvalid() {
    return this.form?.formGroup?.invalid;
  }
  disabled = false;

  imgs: any = [];
  videos: any;
  vids: any = [];
  files: any;

  tags: Map<string, Array<string>> | undefined;

  tag: any = signal([]);
  images: any;
  pdfs: any;
  docs: any;
  entity: any;
  claims: any;

  properties: any;
  propertyList: any;
  propertyData!: Signal<Map<String, any>>;

  statements: any = signal([]);

  markers: Marker[] = [];

  options = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', {
        noWrap: true,
        maxZoom: 5,
        minZoom: 1,
        attribution: '...',
      }),
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909),
  };

  columns: XTableColumn[] = [
    { id: 'index', label: '序号', width: 85, left: 0, type: 'index' },
    { id: 'property', label: '属性名', width: 200 },
    { id: 'value', label: '值', flex: 1 },
  ];

  columns2: XTableColumn[] = [
    { id: 'index', label: '序号', width: 80, left: 0, type: 'index' },
    { id: 'property', label: '属性名', flex: 1 },
    { id: 'name', label: '属性值', flex: 1 },
    { id: 'qualify', label: '限定', width: 80 },
    { id: 'actions', label: '操作', width: 100 },
  ];

  controls: XControl[] = [
    {
      control: 'input',
      id: '_key',
      label: 'ID',
      required: false,
    },
    {
      control: 'find',
      id: 'type',
      label: '类型',
      required: true,
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
      id: 'label',
      label: '标签',
      required: true,
    },
    {
      control: 'input',
      id: 'aliases',
      label: '别名',
      required: false,
    },

    {
      control: 'textarea',
      id: 'description',
      label: '描述',
      required: false,
    },
    {
      control: 'input',
      id: 'source',
      label: 'url',
      required: false,
    },
  ];

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
    private location: Location,
    private cdr: ChangeDetectorRef) {
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
    this.videos = [];
    this.action(this.type);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && changes['id'].currentValue) {
      this.id = changes['id'].currentValue;
      this.action(this.type);
    }
  }

  onImagePaste(event: ClipboardEvent) {
    console.log('粘贴事件触发', event);
    const clipboardData = event.clipboardData || (window as any).clipboardData;

    if (clipboardData) {
      const items = clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();

          if (file) {
            const generateUniqueFileName = (originalName: string): string => {
              const timestamp = new Date().getTime();
              const uniqueSuffix = Math.random().toString(36).substring(2, 10);
              const extension = originalName.substring(originalName.lastIndexOf('.'));
              return `${timestamp}-${uniqueSuffix}${extension}`;
            };

            const uniqueFileName = generateUniqueFileName(file.name);

            console.log('捕获到文件:', file, '生成的新文件名:', uniqueFileName);

            const formData = new FormData();
            formData.append('file', file, uniqueFileName);

            fetch('http://localhost:3000/api/minio-client/uploadFile', {
              method: 'POST',
              body: formData,
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                console.log('上传成功:', data);
                this.uploadImage({ body: { name: data.name } });
              })
              .catch(error => {
                console.error('上传失败:', error);
              });
          }
        }
      }
    }
  }

  uploadImage($event: any) {
    this.imgs.push({
      url: `http://localhost:9000/kgms/${$event.body.name}`,
    });
    this.cdr.detectChanges(); // 手动触发变更检测

    console.log(this.imgs);
  }

  uploadVideo($event: any) {
    console.log('文件上传成功:', $event);
    const videoFile = $event; // 假设 event.file 是上传的视频文件
    console.log(videoFile);
    this.generateVideoCover(videoFile).then(async (coverFile: File) => {
      // 上传封面
      const formData = new FormData();
      formData.append('file', coverFile);

      // 调用 API 上传封面
      fetch('http://localhost:3000/api/minio-client/uploadFile', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('封面上传成功:', data);
          this.vids.push({
            url: `http://localhost:9000/kgms/${$event.body.name}`,
            thumbnail: `http://localhost:9000/kgms/${data.name}`,
          });
          console.log(this.vids);
          console.log(this.imgs);
        })
        .catch((error) => {
          console.error('封面上传失败:', error);
        });

    });

  }


  // 生成视频封面
  generateVideoCover(videoFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // 设置视频源
      videoElement.src = URL.createObjectURL(videoFile);

      // 当视频元数据加载完成时
      videoElement.addEventListener('loadedmetadata', () => {
        // 设置 canvas 尺寸为视频尺寸
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // 跳转到视频的第 1 秒
        videoElement.currentTime = 1;
      });

      // 当视频帧可渲染时
      videoElement.addEventListener('seeked', () => {
        if (context) {
          // 将当前帧绘制到 canvas 上
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // 将 canvas 转换为 Blob
          canvas.toBlob((blob) => {
            if (blob) {
              // 将 Blob 转换为 File
              const coverFile = new File([blob], 'cover.png', {
                type: 'image/png',
              });
              resolve(coverFile);
            } else {
              reject(new Error('无法生成封面'));
            }
          }, 'image/png');
        }
      });

      // 加载视频
      videoElement.load();
    });
  }


  // 上传失败回调
  handleUploadError(event: any) {
    console.error('文件上传失败:', event);
    // 处理上传失败的逻辑
  }

  uploadDocument($event: any) {
    this.docs[this.imgs.length - 1] = {
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


  onMapClick(event: any) {
    const { lat, lng } = event.latlng;
    const newMarker = marker([lat, lng]);
    this.markers = [newMarker];
    this.item.location = { lat: lat, lon: lng };
    console.log(`当前坐标：纬度 ${lat}, 经度 ${lng}`);
  }

  onMapReady(map: any) {
    const southWest = latLng(-90, -180);
    const northEast = latLng(90, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  }

  trackByFn(index: number, item: any): any {
    return item;
  }

  add() {
    console.log(this.statements());
    this.statements = signal([
      ...this.statements(),
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
    ]);
  }

  save(row: any) {
    if (row.mainsnak.datavalue.type != 'wikibase-entityid') {
      row['_to'] = this.item.items[0];
    }
    if (row._key) {
      this.nodeService.updateEdge(row).subscribe(() => {
        this.message.success('更新成功！');
      });
    } else {
      this.nodeService.addEdge(row).subscribe((data) => {
        console.log(data);
        const index = this.statements().findIndex((x: any) => x.id === row.id);
        this.statements()[index]['_key'] = data['_key'];
        this.message.success('新增成功！');
      });
    }
  }

  del(row: any) {
    console.log(row);
    const index = this.statements().findIndex((x: any) => x.id === row.id);
    if (index >= 0) {
      this.statements().splice(index, 1);
    }
    this.nodeService.deleteEdge(row._key).subscribe(() => {
      this.message.success('删除成功！');
    });
  }

  preview(image: any) {
    this.dialogService.create(XImagePreviewComponent, {
      width: '100%',
      height: '100%',
      className: 'x-image-preview-portal',
      data: [
        {
          src: 'http://localhost:9000/kgms/' + image,
        },
      ],
    });
  }

  change(statements: any) {
    statements.mainsnak.datatype = this.propertyList().filter(
      (p: any) => p.name == statements.mainsnak.label
    )[0].type;
    switch (statements.mainsnak.datatype) {
      case 'commonsMedia':
      case 'external-id':
      case 'string':
      case 'url':
      case 'math':
      case 'monolingualtext':
      case 'musical-notation':
        statements.mainsnak.property = `P${this.propertyList().filter(
          (p: any) => p.name == statements.mainsnak.label
        )[0].id
          }`;
        statements.mainsnak.datavalue = {
          value: '',
          type: 'string',
        };
        break;
      case 'globe-coordinate':
        statements.mainsnak.property = `P${this.propertyList().filter(
          (p: any) => p.name == statements.mainsnak.label
        )[0].id
          }`;
        statements.mainsnak.datavalue = {
          value: {
            latitude: 0,
            longitude: 0,
            altitude: null,
            precision: 0,
            globe: 'http://www.wikidata.org/entity/Q2',
          },
          type: 'globecoordinate',
        };
        break;
      case 'quantity':
        statements.mainsnak.property = `P${this.propertyList().filter(
          (p: any) => p.name == statements.mainsnak.label
        )[0].id
          }`;
        statements.mainsnak.datavalue = {
          value: {
            amount: 0,
            unit: '1',
            upperBound: null,
            lowerBound: null,
          },
          type: 'quantity',
        };
        break;
      case 'time':
        statements.mainsnak.property = `P${this.propertyList().filter(
          (p: any) => p.name == statements.mainsnak.label
        )[0].id
          }`;
        statements.mainsnak.datavalue = {
          value: {
            time: '',
            timezone: 0,
            before: 0,
            after: 0,
            precision: 0,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: 'time',
        };
        break;
      case 'wikibase-item':
      case 'wikibase-property':
      case 'wikibase-lexeme':
      case 'wikibase-form':
      case 'wikibase-sense':
        statements.mainsnak.property = `P${this.propertyList().filter(
          (p: any) => p.name == statements.mainsnak.label
        )[0].id
          }`;
        statements.mainsnak.datavalue = {
          value: {
            'entity-type': statements.mainsnak.datatype.replace(
              'wikibase-',
              ''
            ),
            'numeric-id': 0,
            id: '',
          },
          type: 'wikibase-entityid',
        };
        break;
    }
    console.log(statements);
  }


  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.esService.getEntity(this.id).subscribe((x) => {
          console.log(x);
          this.entity = signal({ value: x });
          this.item = x._source;
          this.imgs = [];
          this.tag = signal(this.item?.tags);
          this.item?.images?.forEach((image: any) => {
            this.imgs.push({ url: `http://localhost:9000/kgms/${image}` });
          });
          console.log(this.item);
          if (this.item.location) {
            const newMarker = marker([
              this.item.location.lat,
              this.item.location.lon,
            ]);
            this.markers = [newMarker];
          }
          this.ontologyService.get(x._source.type).subscribe((type: any) => {
            if (this.type == 'edit') {
              this.form.formGroup.patchValue({
                _key: x?._id,
                label: this.item?.labels?.zh?.value,
                aliases: this.item?.aliases?.zh
                  ?.map((aliase: any) => aliase.value)
                  .toString(),
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
                    console.log(x.list);
                    this.propertyList = signal(x.list);

                    this.propertyData = signal(
                      x.list.reduce((acc: any, item: any) => {
                        const key: string = item.group;
                        if (!acc[key]) {
                          acc[key] = [];
                        }
                        acc[key].push(item);
                        return acc;
                      }, {})
                    );
                    this.properties = x.list.map((p: any) => p.name);
                    this.nodeService
                      .getLinks(1, 50, this.id, {})
                      .subscribe((c: any) => {
                        let statements: any = [];
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
                            statements.push(p.edges[0]);
                          }
                          console.log(this.statements);
                          this.statements = signal(statements);
                          this.claims = signal(statements);
                        });
                      });
                  });
              });
          });
          console.log({ knowledgeId: this.id });
          this.nodeService.view({ id: this.id }).subscribe();
        });
        break;
      case 'edit':
        this.action('info');
        break;
      case 'save':
        console.log(this.imgs);
        let item: any = {
          _key: this.form.formGroup.value._key,
          tags: this.tag(),
          labels: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.label,
            },
          },
          aliases: {
            zh: this.form.formGroup.value.aliases
              ?.split(',')
              .map((aliase: any) => {
                return {
                  language: 'zh',
                  value: aliase,
                };
              }),
          },
          descriptions: {
            zh: {
              language: 'zh',
              value: this.form.formGroup.value.description,
            },
          },
          type: this.form.formGroup.value.type,
          // 其他字段
          ...(this.item?.location ? { location: this.item.location } : {}), // 如果 location 存在，生成 location 字段
          ...(this.form.formGroup.value.source ? { sources: [this.form.formGroup.value.source] } : {}), // 如果 source 存在，生成 sources 字段
          ...(this.imgs && this.imgs.length > 0
            ? {
              images: this.imgs.map((i: any) => {
                if (i.url.startsWith('http://') || i.url.startsWith('https://')) {
                  return i.url.replace('http://localhost:9000/kgms/', '');
                } else {
                  return i.url.split('/')[i.url.split('/').length - 1];
                }
              }),
            }
            : {}),
          // 其他字段
          ...(this.vids && this.vids.length > 0
            ? {
              videos: this.vids.map((i: any) => {
                // 处理 URL
                let url = i.url || ''; // 默认值为空字符串
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  url = url.replace('http://localhost:9000/kgms/', '');
                } else {
                  url = url.split('/').pop() || url; // 如果 pop() 返回 undefined，使用原始 URL
                }

                // 处理 Thumbnail
                let thumbnail = i.thumbnail || ''; // 默认值为空字符串
                if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
                  thumbnail = thumbnail.replace('http://localhost:9000/kgms/', '');
                } else {
                  thumbnail = thumbnail.split('/').pop() || thumbnail; // 如果 pop() 返回 undefined，使用原始 Thumbnail
                }

                // 返回新的视频对象
                return {
                  url: url,
                  thumbnail: thumbnail,
                  label: this.form.formGroup.value.label || '默认标签', // 提供默认标签
                  description: this.form.formGroup.value.description || '默认描述', // 提供默认描述
                };
              }),
            }
            : {}),
        };
        console.log(item);
        if (this.type === 'add' || this.type === 'add_image'|| this.type === 'add_video') {
          this.nodeService.post(item).subscribe((x) => {
            this.message.success('新增成功！');
            this.back();
            // this.router.navigate(['/index/entity']);
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
            this.back();
            // this.router.navigate(['/index/entity']);
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
    return this.claims()?.filter(
      (c: any) => c.mainsnak.property == `P${property.id}`
    );
  }

  getFullImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    } else {
      return 'http://localhost:9000/kgms/' + imagePath;
    }
  }

  back() {
    this.location.back();
  }

  close($event: string | number) {
    console.log(this.tag);
    this.tag.update((x: any) => {
      x.splice(x.indexOf($event), 1);
      return [...x];
    });
  }
}
