import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  keyword: string = ''; // 搜索关键字
  isScrolled = false;
  discoverItems = Array.from({ length: 10 }, (_, i) => i + 1); // 初始内容
  newsItems = ['Hot news 1', 'Hot news 2', 'Hot news 3']; // 热点新闻

  constructor(private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 100; // 滚动100px后触发
  }

  onScroll() {
    // 模拟加载更多内容
    this.discoverItems = [
      ...this.discoverItems,
      ...Array.from({ length: 10 }, (_, i) => this.discoverItems.length + i + 1),
    ];
  }

  queryKeyword(keyword:any) {
    this.router.navigate(['/search'], { queryParams: { keyword } });
  }
}