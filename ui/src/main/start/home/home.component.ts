import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EsService } from './es.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  keyword: string = ''; // 搜索关键字
  discoverItems = Array.from({ length: 10 }, (_, i) => i + 1); // 初始内容
  searchContainerStyle: any = {}; // 动态样式
  isLoading = false; // 是否正在加载
  isFixed = false; // 是否固定搜索框
  initialPadding = 20; // 初始 padding (vh)
  minPadding = 0; // 最小 padding
  hots: any[] | undefined;
  entities: any[] = [];
  size: number = 20;
  index: number = 1;
  query: any = { must: [] };

  newsItems: any[] = []; // 新闻列表

  private scrollListener!: () => void;

  constructor(private router: Router, private renderer: Renderer2,
    private service: EsService,

  ) { }
  ngOnInit(): void {
    this.loadNews();

    this.service.getHot().subscribe((res: any) => {
      console.log(res);
      this.hots = res;
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
      this.scrollListener = this.renderer.listen(container, 'scroll', (event: Event) => {
        this.onScrollEvent(container.scrollTop);
      });
    } else {
      console.error('Scroll container not found!');
    }
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      this.scrollListener(); // 移除滚动事件监听器
    }
  }

  // 加载新闻
  loadNews(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    // 模拟 API 请求
    setTimeout(() => {
      const newItems: any[] = [
        { title: '新闻 1', description: '这是纯文本新闻', image: 'https://via.placeholder.com/400x200' },
        { title: '新闻 2', description: '这是带图片的新闻', image: 'https://via.placeholder.com/800x400' },
        { title: '新闻 3', description: '这是带视频的新闻', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { title: '新闻 4', description: '这是纯文本新闻' },
        { title: '新闻 5', description: '这是带图片的新闻', image: 'https://via.placeholder.com/600x300' },
      ];

      this.newsItems = [...this.newsItems, ...newItems];
      this.isLoading = false;
    }, 1000);
  }

  // 根据新闻类型获取卡片宽度
  getCardWidth(news: any): string {
    if (news.video) {
      return 'span 2'; // 视频新闻占 2 列
    } else {
      return 'span 1'; // 不带视频的新闻占 1 列
    }
  }

  onScrollEvent(scrollTop: number) {
    const searchContainer = this.searchContainer.nativeElement;
    const scrollThreshold = searchContainer.offsetTop; // 搜索框距离顶部的初始距离

    if (scrollTop >= scrollThreshold) {
      // 搜索框滚动到顶部时固定
      this.isFixed = true;
      this.searchContainerStyle = {
        position: 'fixed',
        top: '60px', // 固定在导航栏下方
        width: '100%',
        marginTop: `${this.minPadding}vh`, // padding 减小到 0
        marginBottom: `${this.minPadding}vh`,
        transition: 'all 0.3s ease'
      };
    } else {
      // 动态调整 padding
      const padding = Math.max(
        this.minPadding,
        this.initialPadding - (scrollTop / scrollThreshold) * this.initialPadding
      );
      this.isFixed = false;
      this.searchContainerStyle = {
        position: 'relative',
        top: 'auto',
        marginTop: `${padding}vh`, // 动态调整 padding
        marginBottom: `${padding}vh`,
        transition: 'all 0.3s ease'

      };
    }
  }

  onScroll() {
    if (this.isLoading) return;

    this.isLoading = true;
    setTimeout(() => {
      this.discoverItems = [
        ...this.discoverItems,
        ...Array.from({ length: 10 }, (_, i) => this.discoverItems.length + i + 1),
      ];
      this.isLoading = false;
    }, 1000); // 模拟API延迟
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
}