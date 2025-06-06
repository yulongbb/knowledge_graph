import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EsService } from '../../../home/es.service';

@Component({
  selector: 'app-knowledge-default',
  templateUrl: './knowledge-default.component.html',
  styleUrls: ['./knowledge-default.component.scss']
})
export class KnowledgeDefaultComponent implements OnInit {
  entities: any[] = [];
  size: number = 20;
  index: number = 1;
  query: any = { must: [] };
  ip = environment.ip;
  currentRoute: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private esService: EsService
  ) { }

  ngOnInit(): void {
    // 获取当前路由信息
    this.route.url.subscribe(urlSegments => {
      this.currentRoute = urlSegments[urlSegments.length - 1]?.path || 'discover';
      this.loadDataBasedOnRoute();
    });
  }

  loadDataBasedOnRoute(): void {
    // 根据路由类型设置查询条件
    switch (this.currentRoute) {
      case 'discover':
        this.query = {
          must: [],
        };
        break;
      case 'following':
        this.query = {
          must: [{
            match: {
              "followed": true
            }
          }]
        };
        break;
      default:
        this.query = { must: [] };
        break;
    }

    // 重置分页并加载数据
    this.index = 1;
    this.entities = [];
    this.loadEntities();
  }

  loadEntities(): void {
    this.esService
      .searchEntity(this.index, this.size, { bool: this.query })
      .subscribe((data: any) => {
        this.entities = data.list || [];
      });
  }

  // 无限滚动加载
  onScrollEntity(): void {
    this.index++;
    this.esService
      .searchEntity(this.index, this.size, { bool: this.query })
      .subscribe((data: any) => {
        if (data.list && data.list.length > 0) {
          this.entities = [...this.entities, ...data.list];
        }
      });
  }

  // 获取卡片宽度
  getCardWidth(entity: any): string {
    if (entity?._source?.videos?.length > 0) {
      return 'span 2';
    }
    return 'span 1';
  }

  // 导航到实体详情页
  navigateToEntity(entityId: string): void {
    this.router.navigate(['/start/search/info', entityId]);
  }

  // 获取完整图片URL
  getFullImageUrl(imagePath: string): string {
    if (imagePath?.startsWith('http://') || imagePath?.startsWith('https://')) {
      return imagePath;
    } else {
      return 'http://' + this.ip + ':9000/kgms/' + imagePath;
    }
  }
}