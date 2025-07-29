import {
  AfterViewInit,
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
import { ActivatedRoute, ParamMap, Router, NavigationEnd } from '@angular/router';
import { XFormComponent, XControl } from '@ng-nest/ui/form';
import { XMessageService } from '@ng-nest/ui/message';
import {
  XDialogService,
  XGuid,
  XImagePreviewComponent,
  XTableColumn,
  XTableRow,
  XPlace,
  XOperation,
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
import * as Plyr from 'plyr';
import { HttpClient } from '@angular/common/http';
import { NamespaceService } from 'src/main/scene/namespace.service';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['./entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('player') player!: ElementRef;

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
  fs: any = [];

  tags: Map<string, Array<string>> | undefined;

  tag: any = signal([]);
  images: any;
  pdfs: any;
  docs: any;
  entity: any;
  claims: any = signal([]);

  properties: any;
  propertyData!: Signal<Map<String, any>>;

  statements: any = signal([]);

  markers: Marker[] = [];

  videoLoaded: boolean = false;

  // 添加标签选项缓存
  private tagOptionsCache: Map<string, any[]> = new Map();

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
            filter: this.filter,
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
      label: '名称',
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
    {
      control: 'textarea',
      id: 'tags',
      label: '标签',
      span: 8,
      required: false,
    },
  ];

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  }

  private editor: any;

  namespaceOptions: { label: string; value: string }[] = [];
  filter: any[] = [];
  namespace: any;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private message: XMessageService,
    private dialogService: XDialogService,
    public nav: NavService,
    private ontologyService: OntologyService,
    public propertyService: PropertyService,
    private esService: EsService,
    private namespaceService: NamespaceService, // Added namespace service
    private http: HttpClient,
    public tagService: TagService,
    private nodeService: EntityService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.activatedRoute.paramMap.subscribe((x: ParamMap) => {
      const newId = x.get('id');
      const newType = x.get('type');
      if (newId !== this.id || newType !== this.type) {
        this.id = newId as string;
        this.type = newType as string;
        // 当 ID 或类型改变时，强制重新加载数据
        if (this.id) {
          setTimeout(() => {
            this.loadData();
            this.loadNamespaces();
          });
        }
      }
    });
  }

  // Load namespaces for the dropdown
  loadNamespaces() {
    this.namespaceService.getList(1, 1000).subscribe({
      next: (response: any) => {
        const namespaces = response.list || [];
        this.namespaceOptions = namespaces.map((ns: any) => ({
          label: ns.name,
          value: ns.name
        }));

        // Ensure default namespace is selected
        if (!this.namespaceOptions.some(opt => opt.value === 'default')) {
          this.namespaceOptions.unshift({ label: 'default', value: 'default' });
        }

        // Set default namespace
        this.namespace = 'default';
      },
      error: (error:any) => {
        console.error('Failed to load namespaces:', error);
        this.message.error('加载命名空间失败');
        // Ensure at least default namespace is available
        this.namespaceOptions = [{ label: 'default', value: 'default' }];
      }
    });
  }

  // When namespace changes, refresh the types tree
  onNamespaceChange(namespace: string) {
    console.log('Selected namespace:', namespace);
    this.namespaceService.findByName(namespace).subscribe({
      next: (namespaceData: any) => {
        console.log('Found namespace:', namespaceData);
        this.filter = [{
          field: 'namespaceId',
          value: namespaceData.id,
          operation: '=' as XOperation
        }];
      },
      error: (error: any) => {
        console.error('Error finding namespace:', error);
      }
    });

  }


  // 新增加载数据的方法
  loadData() {
    if (this.type === 'info') {
      this.esService.getEntity(this.id).subscribe({
        next: (x: any) => {
          // ...现有的数据加载逻辑...
          this.cdr.detectChanges();
        },
        error: (error:any) => {
          console.error('加载数据失败:', error);
          this.message.error('加载数据失败');
        }
      });
    }
  }

  ngOnInit(): void {
    this.videos = [];
    this.action(this.type);

    // 添加导航事件监听
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // 当导航结束时重新加载数据
        this.action(this.type);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && changes['id'].currentValue) {
      this.id = changes['id'].currentValue;
      this.action(this.type);
    }
  }

  ngAfterViewInit() {
    // new Plyr(this.player.nativeElement, {
    //   autoplay: true,
    //   controls: [
    //     'play',
    //     'progress',
    //     'current-time',
    //     'mute',
    //     'volume',
    //     'fullscreen',
    //   ],
    // });
  }

  ngOnDestroy() {

  }

  onEditorCreated(editor: any) {
    this.editor = editor;
  }

  onDragStart(event: DragEvent, type: string, item: any) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        type,
        item
      }));
    }
  }

  onEditorDragover(event: DragEvent) {
    event.preventDefault();
  }

  onEditorDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const range = this.editor.getSelection(true);

    switch (data.type) {
      case 'text':
        let content = data.item.content || '';

        // 智能替换标签内容为变量
        if (this.item) {
          // 替换标题
          if (this.item.labels?.zh?.value) {
            content = content.replace(
              new RegExp(this.item.labels.zh.value, 'g'),
              '{{labels.zh.value}}'
            );
          }

          // 替换描述
          if (this.item.descriptions?.zh?.value) {
            content = content.replace(
              new RegExp(this.item.descriptions.zh.value, 'g'),
              '{{descriptions.zh.value}}'
            );
          }

          // 替换别名
          this.item.aliases?.zh?.forEach((alias: any) => {
            if (alias.value) {
              content = content.replace(
                new RegExp(alias.value, 'g'),
                '{{aliases.zh.[].value}}'
              );
            }
          });

          // 替换标签
          this.item.tags?.forEach((tag: string) => {
            content = content.replace(
              new RegExp(tag, 'g'),
              '{{tags.[]}}'
            );
          });
        }

        this.editor.clipboard.dangerouslyPasteHTML(range.index, content);
        break;

      case 'image':
        const imageUrl = this.getFullImageUrl(data.item.url);
        // 使用条件渲染包裹图片
        const imageHtml = `
          {{#if images}}
            <img src="${imageUrl}" alt="{{labels.zh.value}}" />
          {{/if}}
        `;
        this.editor.clipboard.dangerouslyPasteHTML(range.index, imageHtml);
        break;

      case 'video':
        const videoHtml = `
          {{#if videos}}
            <video controls width="100%">
              <source src="${this.getFullImageUrl(data.item.url)}" type="video/mp4">
            </video>
            {{#if videos.[0].label}}
              <p class="video-caption">{{videos.[0].label}}</p>
            {{/if}}
          {{/if}}
        `;
        this.editor.clipboard.dangerouslyPasteHTML(range.index, videoHtml);
        break;
    }

    this.editor.setSelection(range.index + 1);
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
              const extension = originalName.substring(
                originalName.lastIndexOf('.')
              );
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
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                console.log('上传成功:', data);
                this.uploadImage({ body: { name: data.name } });
              })
              .catch((error:any) => {
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
    // 上传封面
    const formData = new FormData();
    formData.append('video', videoFile);

    // 调用 API 上传封面
    fetch('http://localhost:3000/api/minio-client/extract', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('封面上传成功:', data);
        this.vids.push({
          url: `http://localhost:9000/kgms/${$event.body.name}`,
          thumbnail: data.thumbnail,
        });
        console.log(this.vids);
        console.log(this.imgs);
      })
      .catch((error:any) => {
        console.error('封面上传失败:', error);
      });
  }

  updateTideohumbnail(url: any) {
    // 获取视频文件
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('视频下载失败');
        }
        return response.blob(); // 将视频转为 Blob 对象
      })
      .then((videoBlob) => {
        console.log('视频 Blob:', videoBlob);

        // 创建一个 FormData 对象，用于上传视频文件
        const formData = new FormData();
        formData.append('video', videoBlob, 'video.mp4'); // 添加视频文件，指定文件名

        // 调用 API 获取封面图
        fetch('http://localhost:3000/api/minio-client/extract', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('封面获取成功:', data);
            // 假设返回的数据包含封面图的 URL
            const thumbnailUrl = data.thumbnail;
            console.log('获取到的封面:', thumbnailUrl);

            // 将封面图 URL 保存到 vids 或其他地方
            // 使用 map 或 find 找到对应 url 的视频对象，并更新封面
            this.vids = this.vids.map((video: any) => {
              if (video.url === url) {
                // 找到对应的 url 后替换其封面图
                video.thumbnail = thumbnailUrl;
              }
              return video; // 返回更新后的对象
            });

            console.log('更新后的 video 数据:', this.vids);
          })
          .catch((error:any) => {
            console.error('封面获取失败:', error);
          });
      })
      .catch((error:any) => {
        console.error('视频下载失败:', error);
      });
  }

  uploadDocument($event: any) {
    console.log('文件上传成功:', $event);
    const pdfFile = $event; // 假设 event.file 是上传的视频文件

    console.log(pdfFile);
    // 上传封面
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    // 调用 API 上传封面
    fetch('http://localhost:3000/api/minio-client/cover', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('封面上传成功:', data);
        this.fs.push({
          url: `http://localhost:9000/kgms/${$event.body.name}`,
          thumbnail: data.cover,
        });
        console.log(this.fs);
      })
      .catch((error:any) => {
        console.error('封面上传失败:', error);
      });
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
          label: '', // 添加 label 字段用于显示
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
    // 判断属性是输入还是选择
    if (this.properties().filter((p: any) => p.name == row.mainsnak.label).length > 0) {
      // 选择
      console.log(this.properties().filter((p: any) => p.name == row.mainsnak.label));

    } else {
      // 新增
      console.log(this.schema);
      console.log(row.mainsnak.label);

    };
    console.log(row);
    if (row._key) {
      this.nodeService.updateEdge(row).subscribe(() => {
        this.message.success('更新成功！');
      });
    } else {
      this.nodeService.addEdge(row).subscribe((data) => {
        console.log(data);
        const index = this.statements().findIndex((x: any) => x === row);
        this.statements()[index]['_key'] = data['_key'];
        this.message.success('新增成功！');
      });
    }
  }

  del(row: any) {
    console.log(row);
    const index = this.statements().findIndex((x: any) => x === row);
    if (index >= 0) {
      this.statements().splice(index, 1);
    }
    this.nodeService.deleteEdge(row._key).subscribe({
      next: () => {
        this.message.success('删除成功！');
        this.location.back();  // 删除成功后返回上一页
      },
      error: (error:any) => {
        this.message.error('删除失败：' + error.message);
      }
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
    console.log('Property changed:', statements);
    
    // 根据选择的属性名找到对应的属性配置
    const selectedProperty = this.properties().find(
      (p: any) => p.name === statements.mainsnak.label
    );
    
    if (!selectedProperty) {
      console.log('No property found for:', statements.mainsnak.label);
      return;
    }

    console.log('Property changed to:', selectedProperty);

    statements.mainsnak.datatype = selectedProperty.type;
    statements.mainsnak.property = `P${selectedProperty.id}`;

    // 立即预加载该属性的标签
    this.loadTagsForProperty(selectedProperty.id.toString());

    // 根据数据类型初始化对应的数据结构
    switch (statements.mainsnak.datatype) {
      case 'commonsMedia':
      case 'external-id':
      case 'string':
      case 'url':
      case 'math':
      case 'monolingualtext':
      case 'musical-notation':
        statements.mainsnak.datavalue = {
          value: '',
          type: 'string',
        };
        break;
      case 'globe-coordinate':
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
        statements.mainsnak.datavalue = {
          value: {
            'entity-type': statements.mainsnak.datatype.replace('wikibase-', ''),
            'numeric-id': 0,
            id: '',
            label: '', // 添加 label 字段用于显示
          },
          type: 'wikibase-entityid',
        };
        break;
    }
    
    console.log('Updated statements:', statements);
  }

  // 新增：获取属性选择选项
  getPropertyOptions(): any[] {
    return this.properties()?.map((property: any) => ({
      label: property.name,
      value: property.name,
      type: property.type
    })) || [];
  }

  // 新增：获取实体选择选项
  getEntityOptions(): any[] {
    // 这里可以根据需要返回可选的实体列表
    // 暂时返回空数组，可以后续扩展为从API获取实体列表
    return [];
  }

  // 新增：获取属性对应的标签选项
  getTagOptionsForProperty(propertyName: string): any[] {
    if (!propertyName || !this.properties()) {
      return [];
    }

    // 找到对应的属性配置
    const property = this.properties().find((p: any) => p.name === propertyName);
    if (!property || !property.id) {
      return [];
    }

    // 这里应该调用标签服务获取该属性关联的标签
    // 暂时返回空数组，需要在实际使用时加载数据
    return this.getTagsForProperty(property.id);
  }

  // 修改：获取特定属性行的标签选项 - 移除调试信息，专注于功能
  getTagOptionsForRow(row: any): any[] {
    if (!row?.mainsnak?.label) {
      return [];
    }

    // 直接使用属性名称找到对应的属性配置
    const property = this.properties()?.find((p: any) => p.name === row.mainsnak.label);
    if (!property || !property.id) {
      return [];
    }
    
    // 使用属性ID获取标签
    const tags = this.getTagsForProperty(property.id.toString());
    
    // 确保返回的数据格式正确
    return tags.filter(tag => tag && tag.value);
  }

  // 修改：根据属性ID获取标签数据
  getTagsForProperty(propertyId: string): any[] {
    // 从缓存中获取
    if (this.tagOptionsCache.has(propertyId)) {
      return this.tagOptionsCache.get(propertyId) || [];
    }

    // 如果缓存中没有，异步加载
    this.loadTagsForProperty(propertyId);
    return [];
  }

  // 修改：异步加载属性对应的标签
  private loadTagsForProperty(propertyId: string): void {
    if (!propertyId) {
      return;
    }

    this.tagService.getList(1, 100, {
      filter: [
        {
          field: 'id',
          value: propertyId,
          relation: 'properties',
          operation: '=',
        },
      ],
    }).subscribe({
      next: (response: any) => {
        const tags = response.list || [];
        const tagOptions = tags.map((tag: any) => ({
          label: tag.name,
          value: tag.name, // 确保value就是name，用于输入框填充
          id: tag.id // 保留id作为引用
        }));
        
        // 缓存结果
        this.tagOptionsCache.set(propertyId, tagOptions);
        
        // 触发变更检测以更新UI
        this.cdr.detectChanges();
      },
      error: (error:any) => {
        console.error('Failed to load tags for property:', error);
        this.tagOptionsCache.set(propertyId, []);
      }
    });
  }

  // 新增：为现有属性预加载标签
  private preloadTagsForExistingProperties(): void {
    if (!this.statements() || !this.properties()) {
      return;
    }

    this.statements().forEach((statement: any) => {
      if (statement.mainsnak?.label) {
        const property = this.properties().find((p: any) => p.name === statement.mainsnak.label);
        if (property && property.id) {
          this.loadTagsForProperty(property.id.toString());
        }
      }
    });
  }

  action(type: string) {
    switch (type) {
      case 'info':
        this.esService.getEntity(this.id).subscribe((x: any) => {
          console.log(x);
          this.namespaceService.get(x._source.namespace).subscribe((namespace: any) => {
            this.namespace = namespace.name;
            this.filter = [{
              field: 'namespaceId',
              value: namespace.id,
              operation: '=' as XOperation
            }];
          });
          this.entity = signal({ value: x });
          this.item = x._source;
          this.imgs = [];
          this.tag = signal(this.item?.tags);
          this.item?.images?.forEach((image: any) => {
            this.imgs.push({ url: `http://localhost:9000/kgms/${image}` });
          });
          this.item?.videos?.forEach((video: any) => {
            this.vids.push({ url: `http://localhost:9000/kgms/${video.url}`, thumbnail: video.thumbnail, label: video.label, description: video.description });
          });
          console.log(this.vids);
          if (this.item.location) {
            const newMarker = marker([
              this.item.location.lat,
              this.item.location.lon,
            ]);
            this.markers = [newMarker];
          }
          this.ontologyService.get(x._source.type).subscribe((type: any) => {
            this.schema = type;
            if (this.type == 'edit') {
              this.form.formGroup.patchValue({
                _key: x?._id,
                label: this.item?.labels?.zh?.value,
                aliases: this.item?.aliases?.zh
                  ?.map((aliase: any) => aliase.value)
                  .toString(),
                type: { id: type?.id, label: type?.name },
                tags: this.item?.tags?.join('#'),
                description: this.item.descriptions?.zh?.value,
              });
            }
            this.ontologyService
              .getAllParentIds(this.item.type)
              .subscribe((parents: any) => {
                parents.push(this.item.type);
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
                    this.properties = signal(x.list);

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
                        
                        // 预加载现有属性的标签
                        this.preloadTagsForExistingProperties();
                      });
                  });
              });
          });
          // this.nodeService.render(this.id).subscribe({
          //   next: (response: any) => {
          //     if (response.success) {
          //       this.renderedContent = response.content;
          //       // this.setupTocFromTemplate();
          //       // this.cdr.detectChanges();
          //     }
          //   },
          //   error: (error: Error) => {
          //     console.error('Template rendering failed:', error);
          //   }
          // });
          console.log({ knowledgeId: this.id });
          this.nodeService.view({ id: this.id }).subscribe();
        });
        break;
      case 'template':
        this.action('info');
        break;
      case 'edit':
        this.action('info');
        break;

      case 'save':
        if (this.type === 'template') {
          const article = {
            title: this.entity().value._source.labels.zh.value + ' 模板',
            content: this.entity().value._source.template,
            author: 'system' // 可以根据实际情况修改作者信息
          };

          // 调用文章API保存模板内容
          this.http.post('/api/article', article).subscribe({
            next: (articleData: any) => {
              const updateData = {
                id: this.id,
                template: articleData.id
              };
              this.nodeService.put(updateData).subscribe(() => {
                this.message.success('模板更新成功！');
                this.back();
              });
              console.log('Template saved as article:', articleData);
            },
            error: (error: any) => {
              console.error('Failed to save template as article:', error);
              this.message.error('保存模板失败：' + error.message);

            }
          });

          return;
        } else if (this.type === 'edit') {
          // 构建更新数据对象
          const updateData: any = {
            id: this.id,
            _key: this.item.items[0].split('/')[1],
            items: this.item.items,
          };

          // 如果表单存在，添加表单数据
          if (this.form?.formGroup.value) {
            const formValue = this.form.formGroup.value;
            Object.assign(updateData, {
              labels: {
                zh: {
                  language: 'zh',
                  value: formValue.label,
                }
              },
              aliases: {
                zh: formValue.aliases?.split(',').map((aliase: string) => ({
                  language: 'zh',
                  value: aliase.trim()
                }))
              },
              descriptions: {
                zh: {
                  language: 'zh',
                  value: formValue.description,
                }
              },
              type: formValue.type?.id,
              tags: formValue.tags?.split('#').filter((x: string) => x.trim() !== '') || [],
            });
          }

          // 添加位置信息
          if (this.item?.location) {
            updateData['location'] = this.item.location;
          }

          // 添加图片信息
          if (this.imgs?.length > 0) {
            updateData['images'] = this.imgs.map((i: any) => {
              if (i.url.startsWith('http://') || i.url.startsWith('https://')) {
                return i.url.replace('http://localhost:9000/kgms/', '');
              }
              return i.url.split('/').pop();
            });
          }

          // 添加视频信息
          if (this.vids?.length > 0) {
            updateData['videos'] = this.vids.map((i: any) => ({
              url: i.url.replace('http://localhost:9000/kgms/', ''),
              thumbnail: i.thumbnail,
              label: i.label || '',
              description: i.description || ''
            }));
          }

          // 添加文档信息
          if (this.fs?.length > 0) {
            updateData['documents'] = this.fs.map((i: any) => ({
              url: i.url.replace('http://localhost:9000/kgms/', ''),
              thumbnail: i.thumbnail,
              label: i.label || '',
              description: i.description || ''
            }));
          }

          // 发送更新请求
          this.nodeService.put(updateData).subscribe({
            next: () => {
              this.message.success('编辑成功！');
              this.back();
            },
            error: (error:any) => {
              this.message.error('编辑失败：' + error.message);
              console.error('更新失败:', error);
            }
          });
        } else if (this.type === 'add' ||
          this.type === 'add_image' ||
          this.type === 'add_video' ||
          this.type === 'add_document') {
          // ...现有的添加逻辑保持不变...
          let item: any = {
            _key: this.form.formGroup.value._key,
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
            tags: this.form.formGroup.value.tags.split('#').filter((x: any) => x != ''),
            // 其他字段
            ...(this.item?.location ? { location: this.item.location } : {}), // 如果 location 存在，生成 location 字段
            ...(this.form.formGroup.value.source
              ? { sources: [this.form.formGroup.value.source] }
              : {}), // 如果 source 存在，生成 sources 字段
            ...(this.imgs && this.imgs.length > 0
              ? {
                images: this.imgs.map((i: any) => {
                  if (
                    i.url.startsWith('http://') ||
                    i.url.startsWith('https://')
                  ) {
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

                  // 返回新的视频对象
                  return {
                    url: url,
                    thumbnail: i.thumbnail,
                    label: i.label ?? this.form.formGroup.value.label, // 提供默认标签
                    description: i.description ?? this.form.formGroup.value.description, // 提供默认描述
                  };
                }),
              }
              : {}),
            ...(this.fs && this.fs.length > 0
              ? {
                documents: this.fs.map((i: any) => {
                  // 处理 URL
                  let url = i.url || ''; // 默认值为空字符串
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    url = url.replace('http://localhost:9000/kgms/', '');
                  } else {
                    url = url.split('/').pop() || url; // 如果 pop() 返回 undefined，使用原始 URL
                  }

                  // 返回新的视频对象
                  return {
                    url: url,
                    thumbnail: i.thumbnail,
                    label: i.label ?? this.form.formGroup.value.label, //供默认标签
                    description: i.description ?? this.form.formGroup.value.description, // 提供默认描述
                  };
                }),
              }
              : {}),
          };
          this.nodeService.post(item).subscribe((x) => {
            this.message.success('新增成功！');
            this.back();
            // this.router.navigate(['/index/entity']);
          });
        }
        break;
      case 'cancel':
        this.back();
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
    }
    return 'http://localhost:9000/kgms/' + imagePath;
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

  onChildSaved() {
    // 延迟执行数据刷新
    setTimeout(() => {
      this.loadData();
      this.cdr.detectChanges();
    }, 200);
  }

  editEntity() {
    this.router.navigate(['/start/search/edit', this.id]);
  }

  editTemplate() {
    this.router.navigate(['/start/search/template', this.id]);
  }

  // 修改：处理实体值变更 - 确保使用name值
  onEntityValueChange(selectedValue: string, row: any): void {
    console.log('Selected value:', selectedValue);
    if (!selectedValue || !row?.mainsnak?.datavalue) {
      return;
    }

    // 根据数据类型处理不同的值设置
    switch (row.mainsnak.datatype) {
      case 'wikibase-item':
        if (row.mainsnak.datavalue.value) {
          row.mainsnak.datavalue.value.label = selectedValue;
          row.mainsnak.datavalue.value.id = selectedValue; // 直接使用名称作为ID
        }
        break;
      case 'string':
      default:
        // 对于string类型和其他类型，直接设置值
        row.mainsnak.datavalue.value = selectedValue;
        break;
    }
  }

  // 修改：处理标签选择变更 - 确保使用name值
  onTagValueChange(selectedValue: string, row: any): void {
    console.log('Tag value selected:', selectedValue);
    if (!selectedValue || !row?.mainsnak?.datavalue) {
      return;
    }

    // 无论选择还是手动输入，都直接使用输入的值
    row.mainsnak.datavalue.value = selectedValue;
  }

  // 日期输入变化时自动识别并校验
  onTimeInputChange(value: string, row: any) {
    if (!row?.mainsnak?.datavalue) return;
    // 支持年、年月、年月日
    const yearReg = /^\d{4}$/;
    const yearMonthReg = /^\d{4}-\d{1,2}$/;
    const yearMonthDayReg = /^\d{4}-\d{1,2}-\d{1,2}$/;

    let valid = false;
    if (yearReg.test(value)) {
      valid = true;
    } else if (yearMonthReg.test(value)) {
      const [y, m] = value.split('-').map(Number);
      valid = m >= 1 && m <= 12;
    } else if (yearMonthDayReg.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      valid = m >= 1 && m <= 12 && d >= 1 && d <= 31;
    }

    if (!valid && value) {
      this.message.warning('请输入有效的日期格式，如：2023、2023-05、2023-05-12');
      row.mainsnak.datavalue.value.time = '';
    } else {
      row.mainsnak.datavalue.value.time = value;
    }
  }

  // 字符串输入时间，自动识别并格式化到datavalue.value（无校验，只做格式转换）
  onTimeStringInput(value: string, row: any) {
    if (!row?.mainsnak?.datavalue) return;
    // 支持年、年月、年月日
    const yearReg = /^\d{4}$/;
    const yearMonthReg = /^\d{4}-\d{1,2}$/;
    const yearMonthDayReg = /^\d{4}-\d{1,2}-\d{1,2}$/;

    let precision = 0;
    let isoTime = '';

    if (yearReg.test(value)) {
      precision = 9; // 年
      isoTime = `+${value}-00-00T00:00:00Z`;
    } else if (yearMonthReg.test(value)) {
      const [y, m] = value.split('-').map(Number);
      precision = 10; // 月
      isoTime = `+${y}-${m.toString().padStart(2, '0')}-00T00:00:00Z`;
    } else if (yearMonthDayReg.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      precision = 11; // 日
      isoTime = `+${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}T00:00:00Z`;
    } else {
      // 其它格式直接存储
      isoTime = value;
      precision = 0;
    }

    row.mainsnak.datavalue.value = {
      after: 0,
      before: 0,
      calendarmodel: "http://www.wikidata.org/entity/Q1985727",
      precision: precision,
      time: isoTime,
      timezone: 0
    };
  }

  // 数量类型输入自动提取数值和单位
  onQuantityInputChange(value: string, row: any) {
    if (!row?.mainsnak?.datavalue) return;
    // 匹配“数值+单位”或纯数值
    // 支持：123kg、123 kg、123.5千克、123
    const match = value.match(/^\s*([+-]?\d+(?:\.\d+)?)(?:\s*([^\d\s]+))?\s*$/);
    if (match) {
      const amount = parseFloat(match[1]);
      const unit = match[2] ? match[2].trim() : '1';
      row.mainsnak.datavalue.value = {
        amount: amount,
        unit: unit,
        upperBound: null,
        lowerBound: null
      };
    } else {
      // 无法解析时全部存到amount，单位为1
      row.mainsnak.datavalue.value = {
        amount: value,
        unit: '1',
        upperBound: null,
        lowerBound: null
      };
    }
  }
}
