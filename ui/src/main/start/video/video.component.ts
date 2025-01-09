import {
  AfterViewInit,
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
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { OntologyService } from '../../ontology/ontology/ontology.service';
import { PropertyService } from '../../ontology/property/property.service';
import { forkJoin } from 'rxjs';
import { EntityService } from '../../entity/entity.service';
import { DomSanitizer } from '@angular/platform-browser';
import { latLng, marker, Marker, tileLayer } from 'leaflet';
import * as L from 'leaflet';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-video',
  styleUrls: ['./video.component.scss'],
  templateUrl: './video.component.html',
})
export class VideoComponent implements OnInit {
  @ViewChildren('thumbnailCanvas')
  thumbnailCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

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
  faVideo = faVideo;

  constructor(
    private sanitizer: DomSanitizer,
    private service: EsService,
    private ontologyService: OntologyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public propertyService: PropertyService,
    private entityService: EntityService,
    private dialogSewrvice: XDialogService
  ) {
    this.activatedRoute.queryParamMap.subscribe((x: ParamMap) => {
      // console.log(x.get('q'));
      // if (x.get('q') != null && x.get('q') != undefined && x.get('q') != '') {
      this.keyword = x.get('q') as string;
      this.selectKeyword(this.keyword);
      // } else {
      //   this.router.navigate(['/']);
      // }
    });
  }
  ngOnInit(): void { }


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
      'http://localhost:9000/kgms/' + this.videos[this.currentVideoIndex].image;
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
      .searchEntity(this.index, this.size, { bool: this.query })
      .subscribe((data: any) => {
        console.log(this.index);
        console.log(data);

        this.total = data.total;
        this.updateVisiblePages();

        this.tags = null;
        this.types = null;
        this.videos = [];

        this.entities = data.list;
        data.list.forEach((item: any) => {
          item?._source?.videos?.forEach((video: any) => {
            this.videos.push({ ...video, ...{ _id: item._id } });
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
    this.router.navigate(['/search'], { queryParams: { q: keyword } });
  }

  selectKeyword(keyword: any) {
    this.keyword = keyword;
    this.index = 1;
    if (keyword != '') {
      if (this.way == '默认检索') {
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
          should: [
            {
              "exists": {
                "field": "videos"  // 确保 videos 字段存在
              }
            },
          ],
        };
      } else if (this.way == '精确检索') {
        this.query = {
          must: [{ term: { 'labels.zh.value.keyword': keyword } }],
          should: [
            {
              "exists": {
                "field": "videos"  // 确保 videos 字段存在
              }
            },
          ],
        };
      } else {
        this.query = {
          must: [{ match: { 'labels.zh.value': keyword } }],
          should: [
            {
              "exists": {
                "field": "videos"  // 确保 videos 字段存在
              }
            },
          ],
        };
      }
    } else {
      this.query = {
        should: [
          {
            "exists": {
              "field": "videos"  // 确保 videos 字段存在
            }
          },
        ],
      };
    }
    this.search();
  }



  action(type: string, item?: any) {
    switch (type) {
      case 'info':
        this.router
          .navigate([`/search/${type}/${item._id}`], {
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
  getFullVideoUrl(imagePath: string): string {
    // 检查 imagePath 是否已经是完整的 URL
    if (imagePath?.startsWith('http://') || imagePath?.startsWith('https://')) {
      return imagePath;
    } else {
      // 如果不是完整的 URL，则添加前缀
      return 'http://localhost:9000/kgms/' + imagePath;
    }
  }

}
