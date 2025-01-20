import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { EsService } from './es.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from 'src/services/auth.service';
import { IndexService } from 'src/layout/index/index.service';
import { NavService } from 'src/services/nav.service';
import { ConfigService } from 'src/services/config.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })), // 初始状态（隐藏时）
      state('*', style({ opacity: 1 })), // 最终状态（显示时）
      transition(':enter', [animate('300ms ease-in')]), // 淡入效果
      transition(':leave', [animate('300ms ease-out')]), // 淡出效果
    ]),
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  keyword: string = ''; // 搜索关键字
  discoverItems = Array.from({ length: 10 }, (_, i) => i + 1); // 初始内容
  searchContainerStyle: any = {}; // 动态样式
  isLoading = false; // 是否正在加载
  isFixed = false; // 是否固定搜索框

  isScroll = false; // 是否滚动
  initialPadding = 20; // 初始 padding (vh)
  minPadding = 0; // 最小 padding
  hots: any[] | undefined;
  today: string = new Date().toISOString().split('T')[0]; // 当前日期

  entities: any[] = [];
  size: number = 20;
  index: number = 1;
  query: any = { must: [] };

  newsItems: any[] = []; // 新闻列表

  private scrollListener!: () => void;
  private lastScrollTop = 0; // 记录上一次滚动位置

  data = signal(['个人中心', '图谱管理', '退出登录']);

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private service: EsService,
    public auth: AuthService,
    public location: Location,
    public indexService: IndexService,
    public nav: NavService,
    private config: ConfigService
  ) { }

  ngOnInit(): void {
    console.log(this.auth);
    this.service.getHot().subscribe((res: any) => {
      console.log(res); // 输出原始数据，便于调试
      this.hots = this.processHotNews(res); // 调用处理函数，将结果存入组件变量
    });

    this.service
      .searchEntity(1, this.size, { bool: this.query })
      .subscribe((data: any) => {
        console.log(data);
        this.entities = data.list;
      });
  }

  ngAfterViewInit() {
    const container = this.scrollContainer.nativeElement;
    if (container) {
      this.scrollListener = this.renderer.listen(
        container,
        'scroll',
        (event: Event) => {
          setTimeout(() => {
            this.onScrollEvent(container.scrollTop);
          }, 500); // 延迟 100ms 确保布局计算完成
        }
      );
    } else {
      console.error('Scroll container not found!');
    }
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      this.scrollListener(); // 移除滚动事件监听器
    }
  }

  nodeClick($event: any) {
    console.log($event);
    if ($event.label == '个人中心') {
      this.router.navigate(['/user']);
    }  if ($event.label == '图谱管理') {
      this.router.navigate(['/index']);
    } else if ($event.label == '退出登录') {
      this.logout();
    }
  }

  onScrollEvent(scrollTop: number) {
    requestAnimationFrame(() => {
      if (scrollTop !== this.lastScrollTop) {
        this.lastScrollTop = scrollTop;
        this.handleScroll(scrollTop);
      }
    });
  }

  handleScroll(scrollTop: number) {
    const searchContainer = this.searchContainer.nativeElement;
    const scrollThreshold = searchContainer.offsetTop; // 搜索框距离顶部的初始距离
    this.isScroll = scrollTop > 0; // 是否滚动

    if (scrollTop >= scrollThreshold) {
      // 搜索框滚动到顶部时固定
      this.isFixed = true;
      this.searchContainerStyle = {
        position: 'fixed',
        top: '60px', // 固定在导航栏下方
        width: '100%',
        background: 'white',
        marginTop: `${this.minPadding}vh`, // padding 减小到 0
        marginBottom: `${this.minPadding}vh`,
        transition: 'all 0.3s ease',
      };
    } else {
      // 动态调整 padding
      const padding = Math.max(
        this.minPadding,
        this.initialPadding -
        (scrollTop / scrollThreshold) * this.initialPadding
      );
      this.isFixed = false;
      this.searchContainerStyle = {
        position: 'relative',
        top: 'auto',
        marginTop: `${padding}vh`, // 动态调整 padding
        marginBottom: `${padding}vh`,
        transition: 'all 0.3s ease',
      };
    }
  }

  onScrollEntity() {
    this.index++;
    this.service
      .searchEntity(this.index, this.size, { bool: this.query })
      .subscribe((data: any) => {
        if (data.list.length > 0) {
          data.list.forEach((d: any) => {
            this.entities.push(d);
          });
        }
      });
  }

  queryKeyword(keyword: any) {
    this.router.navigate(['/search'], { queryParams: { keyword } });
  }

  // 判断新闻是否为新
  isToday(modified: string): boolean {
    return modified.startsWith(this.today);
  }

  // 判断新闻是否为真（示例逻辑：可根据实际需求扩展）
  isVerified(news: any, threshold: number = 3): boolean {
    // 假设验证“真”的逻辑是类型 `type` 的特定值
    if (!news.id._source.items || !Array.isArray(news.id._source.items)) {
      return false;
    }
    return news.id._source.items.length >= threshold;
  }

  // 获取新闻标记（优先级：真 > 新 > 热）
  getTag(news: any, index: number): string {
    const isTrue = this.isVerified(news); // 是否为真
    const isNew = this.isToday(news.id._source.modified); // 是否为新
    const isHot = index < 3; // 前三名标记为热
    if (isTrue) {
      return '真';
    } else if (isNew) {
      return '新';
    } else if (isHot) {
      return '热';
    } else {
      return '';
    }
  }

  processHotNews(data: any[]): any[] {
    const today = new Date().toISOString().split('T')[0]; // 当前日期

    // 按热度分数排序
    const sortedNews = data.sort((a, b) => b.id.score - a.id.score);

    // 添加额外字段（是否新、标记）
    return sortedNews.map((news, index) => ({
      ...news,
      isNew: this.isToday(news.id._source.modified), // 判断是否为新
      tag: this.getTag(news, index) // 获取优先级标记
    }));
  }

  // 根据新闻类型获取卡片宽度
  getCardWidth(news: any): string {
    if (news?._source?.videos?.length > 0) {
      return 'span 2'; // 视频新闻占 2 列
    }
    return 'span 1'; // 不带视频的新闻占 1 列
  }



  /**
   * 退出
   */
  logout() {
    this.auth.logout().subscribe((x) => {
      if (x) {
        this.indexService.removeSession();
        this.indexService.session = { tabsPage: [] };
        this.nav.destroy();
        this.config.deleteRouteSnapshot();
        this.config.deleteRouteSnapshot(this.location.path());
        this.router.navigate(['/login']);
      }
    });
  }
}