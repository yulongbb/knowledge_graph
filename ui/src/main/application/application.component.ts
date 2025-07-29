import { PageBase } from 'src/share/base/base-page';
import { Component, Query, ViewChild } from '@angular/core';
import { IndexService } from 'src/layout/index/index.service';
import {
  XFormRow,
  XGuid,
  XMessageService,
  XQuery,
  XTableColumn,
  XTableComponent,
  XTreeNode,
} from '@ng-nest/ui';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { Application, ApplicationService } from './application.sevice';
import { NamespaceService } from '../scene/namespace.service';

@Component({
  selector: 'app-application',
  templateUrl: 'application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent extends PageBase {
  formGroup = new UntypedFormGroup({});
  name = '';
  category = '';
  description= '';
  selected!: Application;
  type = 'add';
  loading = true;
  categories: string[] = [];
  pinnedApplications: Application[] = [];

  index = 1;
  size = 15;

  query: any = {};

  data = (index: number, size: number, query: any) =>
    this.service.getList(index, size, query).pipe(
      tap((x:any) => {
        console.log('应用数据:', x);
        // 预处理图片路径
        if (x.list) {
          x.list.forEach((app: Application) => {
            if (app.image && !app.image.startsWith('http')) {
              app.image = 'http://localhost:4200/api/' + app.image;
            }
            if (app.screenshots) {
              app.screenshots = app.screenshots.map(screenshot => 
                screenshot.startsWith('http') ? screenshot : 'http://localhost:4200/api/' + screenshot
              );
            }
          });
        }
      }),
      map((x:any) => {
        if (x.list) {
          x.list.forEach((item: any) => {
            // 获取关联的命名空间
            this.namespaceService
            .getList(1, 50, {
              filter: [
                {
                  field: 'id',
                  value: item.id,
                  relation: 'applications',
                  operation: '=',
                },
              ],
            })
            .subscribe((p: any) => {
              item.ontologies = p?.list?.map((o:any)=> o?.id);
            });
          });
        }
        return x;
      })
    );

  columns: XTableColumn[] = [
    { id: 'id', label: '序号', flex: 0.4, left: 0 },
    { id: 'actions', label: '操作', width: 200 },
    { id: 'image', label: '图标', width: 100 },
    { id: 'name', label: '名称', flex: 0.5, sort: true },
    { id: 'category', label: '分类', flex: 0.5 },
    { id: 'rating', label: '评分', width: 120 },
    { id: 'reviews', label: '评价数', width: 120 },
    { id: 'isPinned', label: '置顶', width: 80 },
  ];
  @ViewChild('tableCom') tableCom!: XTableComponent;

  constructor(
    private service: ApplicationService,
    public override indexService: IndexService,
    private message: XMessageService,
    private namespaceService: NamespaceService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(indexService);
  }

  ngOnInit() {
    this.fetchCategories();
    this.fetchPinnedApplications();
  }

  fetchCategories() {
    this.service.getCategories().subscribe(
      categories => {
        this.categories = categories;
        console.log('获取到分类:', categories);
      },
      error => {
        console.error('获取分类失败:', error);
      }
    );
  }

  fetchPinnedApplications() {
    this.service.getPinned().subscribe(
      applications => {
        this.pinnedApplications = applications;
        console.log('获取到置顶应用:', applications);
      },
      error => {
        console.error('获取置顶应用失败:', error);
      }
    );
  }

  searchByName() {
    if (!this.name.trim()) {
      delete this.query.filter;
      this.tableCom.change(1);
      return;
    }
    this.query.filter = [{ field: 'name', value: this.name, operation: 'like' }];
    this.tableCom.change(1);
  }

  searchByCategory() {
    if (!this.category || this.category === '全部') {
      delete this.query.filter;
      this.tableCom.change(1);
      return;
    }
    this.query.filter = [{ field: 'category', value: this.category, operation: '=' }];
    this.tableCom.change(1);
  }

  searchByDescription() {
    if (!this.description.trim()) {
      delete this.query.filter;
      this.tableCom.change(1);
      return;
    }
    this.query.filter = [{ field: 'description', value: this.description, operation: 'like' }];
    this.tableCom.change(1);
  }

  action(type: string, item?: any) {
    switch (type) {
      case 'add':
        this.router.navigate(['./add'], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'info':
        this.router.navigate([`./info/${item.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'edit':
        this.router.navigate([`./edit/${item.id}`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'delete':
        // this.message.dialog({
        //   title: '确认删除',
        //   content: `此操作将永久删除此应用：${item.name}，是否继续？`,
        //   type: 'warning',
        //   buttons: [
        //     {
        //       label: '取消',
        //       type: 'info',
        //     },
        //     {
        //       label: '确认',
        //       type: 'danger',
        //       handler: () => {
        //         this.service.delete(item.id).subscribe(() => {
        //           this.tableCom.change(this.index);
        //           this.message.success('删除成功！');
        //         });
        //       },
        //     },
        //   ],
        // });
        break;
      case 'visit':
        if (item.url) {
          window.open(item.url, '_blank');
        } else {
          this.message.warning('该应用没有设置访问地址');
        }
        break;
      case 'rate':
        const rating = parseInt(prompt('请输入评分(1-5):', '5') || '0');
        if (rating > 0 && rating <= 5) {
          this.service.rateApplication(item.id, rating).subscribe(
            updatedApp => {
              this.message.success('评分成功！');
              this.tableCom.change(this.index);
            },
            error => {
              this.message.error('评分失败，请重试');
            }
          );
        }
        break;
      case 'toggle-pin':
        const newItem = { ...item, isPinned: !item.isPinned };
        this.service.put(newItem).subscribe(() => {
          this.message.success(newItem.isPinned ? '已置顶' : '已取消置顶');
          this.tableCom.change(this.index);
          this.fetchPinnedApplications();
        });
        break;
    }
  }

  // 确保rating不会为undefined时返回安全值
  getStarRating(rating: number | undefined): string {
    if (!rating && rating !== 0) return '';
    
    let stars = '';
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars += i <= roundedRating ? '★' : '☆';
    }
    
    return stars;
  }

  isPinnedText(isPinned: boolean): string {
    return isPinned ? '是' : '否';
  }
}
