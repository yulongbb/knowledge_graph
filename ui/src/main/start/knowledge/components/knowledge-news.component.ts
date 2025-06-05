import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../models/category.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-knowledge-news',
  templateUrl: './knowledge-news.component.html',
  styleUrls: ['./knowledge-news.component.scss']
})
export class KnowledgeNewsComponent implements OnInit {
  @Input() entities: any[] = [];
  @Input() selectedCategory: Category | null = null;
  @Input() onScrollEntity: Function = () => {};

  ip = environment.ip;
  
  // 推荐内容数据
  recommendList = [
    { id: 1, title: '成语起源地，故事有新篇——循迹文脉走读"万年仙居"', image: 'assets/news1.jpg' },
    { id: 2, title: '2025全国高考天气地图:江南北部雨强且持续', image: 'assets/news2.jpg' },
    { id: 3, title: '为什么全网都爱看江苏"内斗"?', image: 'assets/news3.jpg' }
  ];
  
  constructor() { }

  ngOnInit(): void {
  }

  // 滚动加载更多内容
  onScroll(): void {
    if (this.onScrollEntity) {
      this.onScrollEntity();
    }
  }
}
