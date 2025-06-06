import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../../models/category.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { EsService } from 'src/main/start/home/es.service';

@Component({
  selector: 'app-knowledge-news',
  templateUrl: './knowledge-news.component.html',
  styleUrls: ['./knowledge-news.component.scss']
})
export class KnowledgeNewsComponent implements OnInit {
  entities: any[] = [];
  selectedCategory: Category | null = null;
  
  // 分页相关
  size: number = 20;
  index: number = 1;
  
  // 新闻详情状态管理
  showDetail = false;
  currentNewsId = '';
  currentNewsDetails: any = null;
  
  // 详情页相关数据
  imgs: any = [];
  videos: any[] = [];
  pdfs: any[] = [];
  content: string = '';
  tags: string[] = [];
  loading = false;
  
  // 相关推荐
  relatedNews: any[] = [];
  
  // 推荐内容数据
  recommendList = [
    { id: 1, title: '成语起源地，故事有新篇——循迹文脉走读"万年仙居"', image: 'assets/news1.jpg' },
    { id: 2, title: '2025全国高考天气地图:江南北部雨强且持续', image: 'assets/news2.jpg' },
    { id: 3, title: '为什么全网都爱看江苏"内斗"?', image: 'assets/news3.jpg' }
  ];
  
  constructor(
    private http: HttpClient,
    private esService: EsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 初始化新闻数据
    this.loadNewsData();
  }

  // Add trackBy method for performance optimization
  trackByEntityId(index: number, entity: any): string {
    return entity._id;
  }

  // 加载新闻数据
  loadNewsData(): void {
    this.selectedCategory = {
      id: 'news',
      name: '资讯',
      displayName: '资讯',
      description: '最新资讯动态',
      avatar: 'assets/news-avatar.png' // Add avatar property
    } as Category;

    // 尝试多种查询方式来获取新闻数据
    console.log('开始加载新闻数据...');
    
    // 首先尝试使用标签查询
    let newsQuery = {
      must: [{
        bool: {
          should: [
            { match: { "tags": "资讯" } },
            { match: { "tags": "新闻" } },
            { match: { "tags": "news" } }
          ],
          minimum_should_match: 1
        }
      }]
    };

    this.esService.searchEntity(this.index, this.size, { bool: newsQuery }).subscribe({
      next: (data: any) => {
        console.log('标签查询结果:', data);
        if (data.list && data.list.length > 0) {
          this.entities = data.list;
        } else {
          // 如果标签查询没有结果，尝试类型查询
          this.tryTypeQuery();
        }
      },
      error: (error) => {
        console.error('标签查询失败:', error);
        this.tryTypeQuery();
      }
    });
  }

  // 尝试类型查询
  private tryTypeQuery(): void {
    console.log('尝试类型查询...');
    
    let typeQuery = {
      must: [{
        bool: {
          should: [
            { match: { "type": "news" } },
            { match: { "type": "article" } },
            { match: { "type": "资讯" } }
          ],
          minimum_should_match: 1
        }
      }]
    };

    this.esService.searchEntity(this.index, this.size, { bool: typeQuery }).subscribe({
      next: (data: any) => {
        console.log('类型查询结果:', data);
        if (data.list && data.list.length > 0) {
          this.entities = data.list;
        } else {
          // 如果还是没有结果，获取所有数据
          this.loadAllData();
        }
      },
      error: (error) => {
        console.error('类型查询失败:', error);
        this.loadAllData();
      }
    });
  }

  // 加载所有数据作为兜底
  private loadAllData(): void {
    console.log('加载所有数据...');
    
    this.esService.searchEntity(this.index, this.size, { bool: { must: [] } }).subscribe({
      next: (data: any) => {
        console.log('所有数据查询结果:', data);
        this.entities = data.list || [];
        
        // 如果还是没有数据，添加一些模拟数据用于测试
        if (this.entities.length === 0) {
          this.addMockData();
        }
      },
      error: (error) => {
        console.error('加载所有数据失败:', error);
        this.addMockData();
      }
    });
  }

  // 添加模拟数据
  private addMockData(): void {
    console.log('添加模拟数据...');
    
    this.entities = [
      {
        _id: 'mock1',
        _source: {
          labels: { zh: { value: '人工智能技术取得重大突破' } },
          descriptions: { zh: { value: '最新研究显示，人工智能在多个领域取得了重大进展，为未来技术发展奠定了基础。' } },
          source: '科技日报',
          publishTime: '2小时前',
          avatar: 'assets/default-avatar.png',
          screenshot: 'assets/news1.jpg',
          likeCount: 128,
          commentCount: 45
        }
      },
      {
        _id: 'mock2',
        _source: {
          labels: { zh: { value: '全球气候变化新报告发布' } },
          descriptions: { zh: { value: '联合国最新发布的气候变化报告显示，全球变暖趋势仍在加剧，需要立即采取行动。' } },
          source: '环球时报',
          publishTime: '4小时前',
          avatar: 'assets/default-avatar.png',
          screenshot: 'assets/news2.jpg',
          likeCount: 89,
          commentCount: 23
        }
      },
      {
        _id: 'mock3',
        _source: {
          labels: { zh: { value: '新型疫苗研发进展顺利' } },
          descriptions: { zh: { value: '科研团队在新型疫苗研发方面取得重要进展，临床试验结果令人鼓舞。' } },
          source: '健康报',
          publishTime: '6小时前',
          avatar: 'assets/default-avatar.png',
          screenshot: 'assets/news3.jpg',
          likeCount: 156,
          commentCount: 67
        }
      }
    ];
  }

  // 滚动加载更多内容
  onScroll(): void {
    this.index++;
    
    let newsQuery = {
      must: [{
        bool: {
          should: [
            { match: { "tags": "资讯" } },
            { match: { "tags": "新闻" } },
            { match: { "tags": "news" } }
          ],
          minimum_should_match: 1
        }
      }]
    };

    this.esService.searchEntity(this.index, this.size, { bool: newsQuery }).subscribe({
      next: (data: any) => {
        if (data.list && data.list.length > 0) {
          this.entities = [...this.entities, ...data.list];
        }
      },
      error: (error) => {
        console.error('滚动加载失败:', error);
      }
    });
  }
  
  // 查看新闻详情
  viewNewsDetail(newsId: string): void {
    this.loading = true;
    this.currentNewsId = newsId;
    this.showDetail = true;
    
    // 获取详情数据
    this.esService.getEntity(newsId).subscribe({
      next: (data: any) => {
        this.currentNewsDetails = data;
        const item = data._source;
        this.tags = item?.tags || [];
        
        // 处理图片
        this.imgs = item?.images?.map((image: any) => ({
          url: `http://localhost:9000/kgms/${image}`,
        })) || [];

        // 处理视频
        this.videos = item?.videos?.map((video: any) => ({
          url: `http://localhost:9000/kgms/${video.url}`,
          type: this.getVideoType(video.url),
        })) || [];

        // 处理 PDF
        this.pdfs = item?.pdfs?.map((pdf: any) => ({
          url: `http://localhost:9000/kgms/${pdf}`,
          name: pdf.split('/').pop(),
        })) || [];

        // 获取内容模板
        if (item.template) {
          this.http.get(`/api/article/render/${item.template}`).subscribe({
            next: (response: any) => {
              if (response.success) {
                this.content = response.content;
              }
              this.loading = false;
            },
            error: () => {
              this.content = item?.descriptions?.zh?.value || '';
              this.loading = false;
            }
          });
        } else {
          this.content = item?.descriptions?.zh?.value || '';
          this.loading = false;
        }

        // 获取相关新闻（这里使用模拟数据）
        this.loadRelatedNews();
      },
      error: (error) => {
        console.error('加载新闻详情失败:', error);
        this.loading = false;
      }
    });
  }
  
  // 返回新闻列表
  closeNewsDetail(): void {
    this.showDetail = false;
    this.currentNewsId = '';
    this.currentNewsDetails = null;
  }
  
  // 加载相关新闻
  private loadRelatedNews() {
    // 实际应用中应基于标签/分类获取相关新闻
    // 这里使用模拟数据
    this.relatedNews = [
      { id: 'mock1', title: '相关资讯：人工智能在医疗领域的新应用', source: '科技日报', time: '3小时前' },
      { id: 'mock2', title: '相关资讯：大数据分析助力精准医疗', source: '人民日报', time: '5小时前' },
      { id: 'mock3', title: '相关资讯：未来医疗的发展趋势', source: '健康时报', time: '昨天' }
    ];
  }
  
  hasMediaContent(): boolean {
    return !!(this.imgs?.length || this.videos?.length || this.pdfs?.length);
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }

  openPdf(url: string): void {
    window.open(url, '_blank');
  }

  private getVideoType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'ogg':
        return 'video/ogg';
      default:
        return 'video/mp4';
    }
  }
}
