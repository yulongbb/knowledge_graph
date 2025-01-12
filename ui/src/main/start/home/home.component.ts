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
  newsItems = ['Hot news 1', 'Hot news 2', 'Hot news 3']; // 热点新闻
  searchContainerStyle: any = {}; // 动态样式
  isLoading = false; // 是否正在加载
  isFixed = false; // 是否固定搜索框
  initialPadding = 20; // 初始 padding (vh)
  minPadding = 0; // 最小 padding
  hots: any[] | undefined;

  private scrollListener!: () => void;

  constructor(private router: Router, private renderer: Renderer2,
        private service: EsService,
    
  ) {}
  ngOnInit(): void {
    this.service.getHot().subscribe((res: any) => {
      console.log(res);
      this.hots = res;
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

  queryKeyword(keyword: any) {
    this.router.navigate(['/search'], { queryParams: { keyword } });
  }
}