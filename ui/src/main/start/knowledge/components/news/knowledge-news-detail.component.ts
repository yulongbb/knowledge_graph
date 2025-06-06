import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EsService } from 'src/main/start/search/es.service';
import { HttpClient } from '@angular/common/http';
import { Signal, signal } from '@angular/core';

@Component({
  selector: 'app-knowledge-news-detail',
  templateUrl: './knowledge-news-detail.component.html',
  styleUrls: ['./knowledge-news-detail.component.scss']
})
export class KnowledgeNewsDetailComponent implements OnInit {
  id!: string;
  entity: any;
  item: any;
  imgs: any = [];
  videos: any[] = [];
  pdfs: any[] = [];
  tag = signal([]);
  content: string = '';
  loading: boolean = true;
  
  // 相关推荐
  relatedNews: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private esService: EsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id') || '';
      if (this.id) {
        this.loadNewsData();
      } else {
        this.router.navigate(['/start/knowledge/news']);
      }
    });
  }

  private loadNewsData() {
    this.loading = true;
    
    this.esService.getEntity(this.id).subscribe({
      next: (data: any) => {
        this.entity = signal({ value: data });
        this.item = data._source;
        this.tag.set(this.item?.tags || []);
        
        // Handle images
        this.imgs = this.item?.images?.map((image: any) => ({
          url: `http://localhost:9000/kgms/${image}`,
        })) || [];

        // Handle videos
        this.videos = this.item?.videos?.map((video: any) => ({
          url: `http://localhost:9000/kgms/${video.url}`,
          type: this.getVideoType(video.url),
        })) || [];

        // Handle PDFs
        this.pdfs = this.item?.pdfs?.map((pdf: any) => ({
          url: `http://localhost:9000/kgms/${pdf}`,
          name: pdf.split('/').pop(),
        })) || [];

        // Get content from template if available
        if (this.item.template) {
          this.http.get(`/api/article/render/${this.item.template}`).subscribe({
            next: (response: any) => {
              if (response.success) {
                this.content = response.content;
              }
              this.loading = false;
            },
            error: () => {
              this.content = this.item?.descriptions?.zh?.value || '';
              this.loading = false;
            }
          });
        } else {
          this.content = this.item?.descriptions?.zh?.value || '';
          this.loading = false;
        }

        // Get related news (mock data for now)
        this.loadRelatedNews();
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.loading = false;
      }
    });
  }

  private loadRelatedNews() {
    // In real application, you would fetch related news based on tags/category
    // For now, we'll just set some mock data
    this.relatedNews = [
      { id: 'mock1', title: '相关资讯：人工智能在医疗领域的新应用', source: '科技日报', time: '3小时前' },
      { id: 'mock2', title: '相关资讯：大数据分析助力精准医疗', source: '人民日报', time: '5小时前' },
      { id: 'mock3', title: '相关资讯：未来医疗的发展趋势', source: '健康时报', time: '昨天' }
    ];
  }

  goBack() {
    this.router.navigate(['/start/knowledge/news']);
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
