import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { XDialogService, XImagePreviewComponent } from '@ng-nest/ui';
import { EsService } from './es.service';
import { ActivatedRoute, ParamMap, Router, NavigationEnd } from '@angular/router';
import { OntologyService } from '../../ontology/ontology/ontology.service';
import { PropertyService } from '../../ontology/property/property.service';
import { forkJoin } from 'rxjs';
import { EntityService } from '../../entity/entity.service';
import { DomSanitizer } from '@angular/platform-browser';
import { latLng, marker, Marker, tileLayer } from 'leaflet';
import * as L from 'leaflet';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog/image.dialog.component';
import { environment } from 'src/environments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-image',
  styleUrls: ['./image.component.scss'],
  templateUrl: './image.component.html',
})
export class ImageComponent implements OnInit {
  ip = environment.ip;
  entities: any;
  knowledge: any;

  waies = signal(['默认检索', '精确检索', '模糊检索']);
  way = '模糊检索';

  navItems = signal([
    { link: '/search', label: '知识' },
    { link: '/image', label: '图片' },
    { link: '/video', label: '视频' },
    { link: '/document', label: '文件' },
    { link: '/map', label: '地图' },
  ]);
  menu: any = signal('知识');

  query: any = { bool: {} };

  keyword = '';

  size: number = 20;
  index: number = 1;
  total: number = 0; // 总条数
  visiblePages: number[] = []; // 显示的页码
  showEllipsis: boolean = false; // 是否显示省略号

  types: any;
  type: any;
  tags: any;
  tag: any;

  images!: any;
  videos!: any;
  pdfs!: any;

  options = {
    layers: [
      tileLayer('http://localhost/gis/{z}/{x}/{y}.jpg', {
        noWrap: true,
        maxZoom: 6,
        minZoom: 1,
        attribution: '...',
      }),
    ],
    zoom: 3,
    center: latLng(46.879966, -121.726909),
  };

  markers: Marker[] = [];
  currentVideoIndex = 0; // 当前视频索引
  currentVideoSrc: any; // 当前视频路径
  scrollTimeout: any; // 防止快速滚动
  faImage = faImage;

  constructor(
    private sanitizer: DomSanitizer,
    private service: EsService,
    private ontologyService: OntologyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public propertyService: PropertyService,
    public dialog: MatDialog,
    private dialogSewrvice: XDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.activatedRoute.queryParamMap.subscribe((x: ParamMap) => {
      this.keyword = x.get('keyword') as string;
      this.loadData(); // 改为调用 loadData
    });
  }

  ngOnInit(): void {
    // 订阅路由事件
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadData(); // 导航结束后重新加载数据
    });
  }

  // 修改加载数据的方法
  loadData() {
    console.log('Loading data with keyword:', this.keyword);
    
    // 构建基础查询，不需要外层的 query 字段
    this.query = {
      bool: {
        filter: [
          {
            exists: {
              field: "images"
            }
          }
        ]
      }
    };

    // 添加关键词搜索条件
    if (this.keyword) {
      if (!this.query.bool.must) {
        this.query.bool.must = [];
      }
      this.query.bool.must.push({
        match: {
          'labels.zh.value': this.keyword
        }
      });
    }

    // 执行搜索
    this.search();
  }

  // 计算总页数
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }

  // 更新显示的页码
  updateVisiblePages(): void {
    const pages = [];
    const maxVisible = 5; // 最多显示 5 个页码
    let start = Math.max(1, this.index - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    this.visiblePages = pages;
    this.showEllipsis = end < this.totalPages; // 是否显示省略号
  }

  // 处理页码变化
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.index = page;
      this.search();
    }
  }

  // 处理鼠标滚动事件
  videoScroll(event: WheelEvent): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout); // 避免重复触发
    }

    this.scrollTimeout = setTimeout(() => {
      if (event.deltaY > 0) {
        this.nextVideo(); // 向下滚动，切换到下一视频
      } else if (event.deltaY < 0) {
        this.prevVideo(); // 向上滚动，切换到上一视频
      }
    }, 200); // 设置防抖时间
  }

  // 切换到下一视频
  nextVideo(): void {
    if (this.currentVideoIndex < this.videos.length - 1) {
      this.currentVideoIndex++;
      this.updateVideoSrc();
    }
  }

  // 切换到上一视频
  prevVideo(): void {
    if (this.currentVideoIndex > 0) {
      this.currentVideoIndex--;
      this.updateVideoSrc();
    }
  }

  // 更新视频源
  updateVideoSrc(): void {
    this.currentVideoSrc =
      'http://'+this.ip+':9000/kgms/' + this.videos[this.currentVideoIndex].image;
  }

  get transitionStyle(): string {
    return `translateY(-${this.currentVideoIndex * 100}%)`;
  }

  onMapReady(map: any) {
    // 设置拖动边界（限制地图范围）
    const southWest = latLng(-90, -180); // 西南角坐标
    const northEast = latLng(90, 180); // 东北角坐标
    const bounds = L.latLngBounds(southWest, northEast);

    map.setMaxBounds(bounds);
  }
  // 地图点击事件处理函数
  onMapClick(event: any) {
    this.markers = [];
    const { lat, lng } = event.latlng;

    this.service
      .searchEntity(1, 10, {
        geo_distance: {
          distance: '500km',
          location: {
            lat: lat,
            lon: lng,
          },
        },
      })
      .subscribe((data: any) => {
        this.entities = data.list;
        let menu: any = [];
        let arr: any = [];
        data.types.forEach((m: any) => {
          arr.push(this.ontologyService.get(m.key));
        });
        forkJoin(arr).subscribe((properties: any) => {
          data.types.forEach((m: any) => {
            menu.push({
              id: m.key,
              label: properties.filter((p: any) => p.id == m.key)[0].name,
            });
          });
          let menuMerge = [];
          menuMerge = data.types.map((m: any, index: any) => {
            return { ...m, ...menu[index] };
          });
          menuMerge.unshift({ id: '', label: '全部' });
          this.types = menuMerge;
        });

        data.list.forEach((entity: any) => {
          const newMarker = marker([
            entity._source.location.lat,
            entity._source.location.lon,
          ]);
          this.markers.push(newMarker);
        });
      });
  }

  selectMenu(menu: any) {
    this.router.navigate(['/' + menu.name], {
      queryParams: { q: this.keyword },
    });
  }

  search() {
    this.service
      .searchEntity(this.index, this.size, this.query)
      .subscribe((data: any) => {
        this.total = data.total;
        this.updateVisiblePages();

        this.tags = null;
        this.types = null;
        this.images = [];

        this.entities = data.list;
        data.list.forEach((item: any) => {
          if (item._source.location) {
            const newMarker = marker([
              item._source.location.lat,
              item._source.location.lon,
            ]);
            this.markers.push(newMarker);
          }

          item?._source?.images?.forEach((image: any) => {
            this.images.push({
              _id: item._id,
              image: image,
              label: item?._source.labels.zh.value,
              description: item?._source.descriptions.zh.value,
            });
          });
        });

        let menu: any = [];
        let arr: any = [];
        data.types.forEach((m: any) => {
          arr.push(this.ontologyService.get(m.key));
        });
        forkJoin(arr).subscribe((properties: any) => {
          data.types.forEach((m: any) => {
            menu.push({
              id: m.key,
              label: properties.filter((p: any) => p.id == m.key)[0].name,
            });
          });
          let menuMerge = [];
          menuMerge = data.types.map((m: any, index: any) => {
            return { ...m, ...menu[index] };
          });
          menuMerge.unshift({ id: '', label: '全部' });
          this.types = menuMerge;
        });
        let tags: any = [];
        data.tags.forEach((t: any) => {
          tags.push(t.key);
        });
        this.tags = tags;
      });
  }

  queryKeyword(keyword: any) {
    this.router.navigate(['/start/image'], { queryParams: { keyword } });
  }

  selectKeyword(keyword: any) {
    this.keyword = keyword;
    this.index = 1;

    // 构建查询条件
    this.query = {
      bool: {
        filter: [
          {
            exists: {
              field: "images"
            }
          }
        ]
      }
    };

    if (keyword) {
      if (!this.query.bool.must) {
        this.query.bool.must = [];
      }
      
      if (this.way == '默认检索') {
        this.query.bool.must.push({
          match: {
            'labels.zh.value': {
              query: keyword,
              operator: 'and'
            }
          }
        });
      } else if (this.way == '精确检索') {
        this.query.bool.must.push({
          term: {
            'labels.zh.value.keyword': keyword
          }
        });
      } else {
        this.query.bool.must.push({
          match: {
            'labels.zh.value': keyword
          }
        });
      }
    }

    this.search();
  }

  selectTag(tag: any) {
    if (this.type && this.type.id) {
      if (tag.length > 0) {
        let values: any = [];
        tag.forEach((t: any) => {
          values.push({ term: { 'tags.keyword': t } });
        });
        this.query = {
          must: [{ term: { 'type.keyword': this.type.id } }].concat(values),
        };
      } else {
        this.query = { must: [{ term: { 'type.keyword': this.type.id } }] };
      }
    } else {
      if (tag.length > 0) {
        let values: any = [];
        tag.forEach((t: any) => {
          values.push({ term: { 'tags.keyword': t } });
        });
        this.query = { must: values };
      } else {
        this.query = {};
      }
    }
    this.search();
  }

  selectType(type: any) {
    this.type = type;
    this.index = 1;
    if (this.keyword != '') {
      if (this.way == '默认检索') {
        this.query = {
          must: [
            {
              match: {
                'labels.zh.value': {
                  query: this.keyword,
                  operator: 'and',
                },
              },
            },
            { term: { 'type.keyword': type.id } },
          ],
          should: [
            { wildcard: { images: '*jpeg' } },
            { wildcard: { images: '*jpg' } },
            { wildcard: { images: '*png' } },
            { wildcard: { images: '*webp' } },
          ],
        };
      } else if (this.way == '精确检索') {
        this.query = {
          must: [
            { term: { 'labels.zh.value.keyword': this.keyword } },
            { term: { 'type.keyword': type.id } },
          ],
          should: [
            {
              "exists": {
                "field": "images"  // 确保 videos 字段存在
              }
            },
          ],
        };
      } else {
        this.query = {
          must: [
            { match: { 'labels.zh.value': this.keyword } },
            { term: { 'type.keyword': type.id } },
          ],
          should: [{
            "exists": {
              "field": "images"  // 确保 videos 字段存在
            }
          },
          ],
        };
      }
    } else {
      if (type.id != '') {
        this.query = {
          must: [{ term: { 'type.keyword': type.id } }],
          should: [{
            "exists": {
              "field": "images"  // 确保 videos 字段存在
            }
          },
          ],
        };
      } else {
        this.query = {
          should: [{
            "exists": {
              "field": "images"  // 确保 videos 字段存在
            }
          },
          ],
        };
      }
    }
    this.search();
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'info':
        this.router
          .navigate([`/start/search/${type}/${item._id}`], {
            relativeTo: this.activatedRoute,
          })
          .then(() => { });
        break;
    }
  }

  trustUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // 在你的组件类中添加此方法
  getFullImageUrl(imagePath: string): string {
    // 检查 imagePath 是否已经是完整的 URL
    if (imagePath?.startsWith('http://') || imagePath?.startsWith('https://')) {
      return imagePath;
    } else {
      // 如果不是完整的 URL，则添加前缀
      return 'http://'+this.ip+':9000/kgms/' + imagePath;
    }
  }

  openDialog(index: number, images: Array<any>): void {
    // 构建图片数据
    const imageList = images.map(image => ({
      url: image.image?.startsWith('http://') || image.image.startsWith('https://')
        ? image.image 
        : 'http://'+this.ip+':9000/kgms/' + image.image,
      title: image.label
    }));

    // 打开自定义对话框
    this.dialog.open(ImageDialogComponent, {
      width: '100%',
      height: '100%',
      panelClass: 'image-preview-dialog',
      data: {
        images: imageList,
        currentIndex: index
      }
    });
  }

  preview(i: any, images: Array<any>) {
    console.log(images.map((image: any) => {
      if (image.image?.startsWith('http://') || image.image.startsWith('https://')) {
        return { src: image.image };
      } else {
        // 如果不是完整的 URL，则添加前缀
        return { src: 'http://'+this.ip+':9000/kgms/' + image.image };
      }
    }));

    // 检查 imagePath 是否已经是完整的 URL
    this.dialogSewrvice.create(XImagePreviewComponent, {
      width: '100%',
      height: '100%',
      className: 'x-image-preview-portal',
      data: images.slice(i, images.length).map((image: any) => {
        if (image.image?.startsWith('http://') || image.image.startsWith('https://')) {
          return { src: image.image };
        } else {
          // 如果不是完整的 URL，则添加前缀
          return { src: 'http://'+this.ip+':9000/kgms/' + image.image, previewText: image.label };
        }
      }),
    });
  }
}
