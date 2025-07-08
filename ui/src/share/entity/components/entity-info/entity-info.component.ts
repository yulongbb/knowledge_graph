import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EsService } from 'src/main/start/search/es.service';
import { EntityService } from 'src/main/entity/entity.service';
import { Signal, signal } from '@angular/core';
import { OntologyService } from 'src/main/ontology/ontology/ontology.service';
import { PropertyService } from 'src/main/ontology/property/property.service';

@Component({
  selector: 'app-entity-info',
  templateUrl: './entity-info.component.html',
  styleUrls: ['./entity-info.component.scss'],
})
export class EntityInfoComponent implements OnInit, AfterViewInit {
  @Input() id!: string;
  @ViewChild('contentMain') contentMain!: ElementRef;

  @ViewChild('wikiInfo') wikiInfo!: ElementRef;

  entity: any;
  item: any;
  imgs: any = [];
  videos: any[] = [];
  pdfs: any[] = [];
  tag = signal([]);
  renderedContent: string = '';
  tableOfContents: any[] = []; // Initialize as empty array
  currentSection: string = '';
  isTocVisible: boolean = false;
  hasTableOfContents: boolean = true;

  // 添加属性相关的属性
  properties: any = signal([]);
  statements: any = signal([]);
  claims: any = signal([]);

  constructor(
    private router: Router,
    private esService: EsService,
    private entityService: EntityService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    // 添加新的服务
    private ontologyService: OntologyService,
    private propertyService: PropertyService
  ) {}

  ngOnInit() {
    window.addEventListener('hashchange', () => this.onHashChange());

    // 监听滚动以更新当前章节
    window.addEventListener('scroll', () => this.checkActiveSection(), {
      passive: true,
    });

    // 如果有初始 hash，滚动到对应位置
    if (window.location.hash) {
      setTimeout(() => {
        this.scrollToSection(window.location.hash.slice(1));
      }, 100);
    }
    this.loadEntityData();

    window.addEventListener('hashchange', () => this.onHashChange());
    window.addEventListener('scroll', () => this.checkActiveSection(), {
      passive: true,
    });

    if (window.location.hash) {
      setTimeout(() => {
        this.scrollToSection(window.location.hash.slice(1));
      }, 100);
    }
  }

  ngAfterViewInit() {
    // 添加滚动事件监听
    if (this.contentMain?.nativeElement) {
      this.contentMain.nativeElement.addEventListener(
        'scroll',
        () => {
          this.onContentScroll();
        },
        { passive: true }
      );
    }

    this.hasTableOfContents = this.tableOfContents.length > 0;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    window.removeEventListener('hashchange', () => this.onHashChange());
    window.removeEventListener('scroll', () => this.checkActiveSection());
  }

  onContentScroll() {
    const scrollPosition = window.pageYOffset;
    const headings = document.querySelectorAll('.section-heading');
    const offset = 100;

    // 找到当前可见的标题
    let currentSection = '';

    headings.forEach((heading) => {
      const elementTop =
        heading.getBoundingClientRect().top + window.pageYOffset;
      if (elementTop - offset <= scrollPosition) {
        currentSection = heading.id;
      }
    });

    if (this.currentSection !== currentSection && currentSection) {
      this.currentSection = currentSection;
      this.cdr.detectChanges();
    }
  }

  private loadEntityData() {
    this.esService.getEntity(this.id).subscribe((x: any) => {
      this.entity = signal({ value: x });
      this.item = x._source;
      console.log('Entity data:', this.item); // Debug log
      this.tag.set(this.item?.tags || []);

      // Handle images
      this.imgs =
        this.item?.images?.map((image: any) => ({
          url: `http://localhost:9000/kgms/${image}`,
        })) || [];

      // Handle videos
      this.videos =
        this.item?.videos?.map((video: any) => ({
          url: `http://localhost:9000/kgms/${video.url}`,
          type: this.getVideoType(video.url),
        })) || [];

      // Handle PDFs
      this.pdfs =
        this.item?.pdfs?.map((pdf: any) => ({
          url: `http://localhost:9000/kgms/${pdf}`,
          name: pdf.split('/').pop(),
        })) || [];

      // 加载属性信息
      this.loadPropertiesAndStatements();

      // 调用文章API保存模板内容
      this.http.get(`/api/article/render/${this.item.template}`).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.renderedContent = response.content;

            // 等待 DOM 更新后解析目录
            setTimeout(() => {
              // 使用 DOMParser 解析 HTML 内容
              const parser = new DOMParser();
              const doc = parser.parseFromString(
                this.renderedContent,
                'text/html'
              );
              const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));

              console.log('Found headings:', headings.length); // Debug log

              this.tableOfContents = headings.map((heading, index) => {
                const title = heading.textContent?.trim() || '';
                const level = parseInt(heading.tagName[1]);
                const anchor = `section-${index}`;

                return {
                  title,
                  level,
                  anchor,
                };
              });

              console.log('Generated TOC:', this.tableOfContents); // Debug log
              this.cdr.detectChanges();

              // 更新实际 DOM 中的标题
              setTimeout(() => {
                document
                  .querySelectorAll(
                    '.wiki-body h1, .wiki-body h2, .wiki-body h3'
                  )
                  .forEach((heading, index) => {
                    heading.id = `section-${index}`;
                    heading.classList.add('section-heading');
                  });
              }, 0);
            }, 0);
          }
        },
        error: (error) => {
          console.error('Failed to save template as article:', error);
        },
      });
    });
  }

  // 添加加载属性和声明的方法
  private loadPropertiesAndStatements() {
    if (!this.item?.type) {
      return;
    }

    // 获取实体类型信息
    this.ontologyService.get(this.item.type).subscribe((type: any) => {
      // 获取所有父类型ID
      this.ontologyService.getAllParentIds(this.item.type).subscribe((parents: any) => {
        parents.push(this.item.type);
        
        // 获取相关属性
        this.propertyService.getList(1, 50, {
          filter: [
            {
              field: 'id',
              value: parents as string[],
              relation: 'schemas',
              operation: 'IN',
            },
          ],
        }).subscribe((propertiesResponse: any) => {
          this.properties.set(propertiesResponse.list || []);
          
          // 获取实体的声明/属性值
          this.entityService.getLinks(1, 50, this.id, {}).subscribe((linksResponse: any) => {
            let statements: any = [];
            
            if (linksResponse.list) {
              linksResponse.list.forEach((p: any) => {
                if (p.edges[0].mainsnak.property !== 'P31') {
                  // 找到对应的属性名称
                  const property = propertiesResponse.list.find(
                    (prop: any) => p.edges[0].mainsnak.property === `P${prop.id}`
                  );
                  
                  if (property) {
                    p.edges[0].mainsnak.label = property.name;
                    p.edges[0].mainsnak.group = property.group;
                    
                    // 处理关联实体的显示
                    if (p.edges[0]['_from'] !== p.edges[0]['_to'] && p.vertices[1]) {
                      p.edges[0].mainsnak.datavalue.value.id = p.vertices[1]?.id;
                      p.edges[0].mainsnak.datavalue.value.label = p.vertices[1]?.labels?.zh?.value;
                    }
                    
                    statements.push(p.edges[0]);
                  }
                }
              });
            }
            
            this.statements.set(statements);
            this.claims.set(statements);
            this.cdr.detectChanges();
          });
        });
      });
    });
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

  editEntity() {
    this.router.navigate(['/start/search/edit', this.id]);
  }

  editTemplate() {
    this.router.navigate(['/start/search/template', this.id]);
  }

  deleteEntity() {
    if (confirm('确定要删除这个知识吗？此操作不可恢复。')) {
      this.entityService.deleteItem(this.id).subscribe({
        next: (response: any) => {
          console.log('Delete response:', response); // Debug log
          if (response.success) {
            this.router.navigate(['/start/search'], {
              queryParams: { keyword: '' },
            });
          } else {
            alert('删除失败：' + response.message);
          }
        },
        error: (error:any) => {
          alert('删除失败：' + error.message);
        },
      });
    }
  }

  toggleToc() {
    this.isTocVisible = !this.isTocVisible;
  }

  closeToc() {
    this.isTocVisible = false;
  }

  scrollToSection(anchor: string) {
    this.closeToc(); // 点击目录项时关闭目录
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.currentSection = hash;
      this.highlightSection(hash);
    }
  }

  highlightSection(anchor: string) {
    const element = document.getElementById(anchor);
    if (element) {
      // 移除之前的高亮
      document.querySelectorAll('.highlight-section').forEach((el) => {
        el.classList.remove('highlight-section');
      });

      // 添加新的高亮
      element.classList.add('highlight-section');
      setTimeout(() => {
        element.classList.remove('highlight-section');
      }, 2000);
    }
  }

  checkActiveSection() {
    const headings: any = document.querySelectorAll('.section-heading');
    const scrollPosition = window.scrollY;

    for (const heading of headings) {
      const sectionTop = heading.offsetTop - 100;
      const sectionBottom = sectionTop + heading.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const newSection = heading.id;
        if (this.currentSection !== newSection) {
          this.currentSection = newSection;
          // 更新 URL 但不触发新的滚动
          history.replaceState(null, '', `#${newSection}`);
          this.cdr.detectChanges();
        }
        break;
      }
    }
  }

  private generateAnchor(text: string | null): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
      .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
  }

  hasProperties(): boolean {
    return this.getBasicProperties().length > 0 || this.getTechnicalProperties().length > 0;
  }

  getBasicProperties(): { label: string; value: string }[] {
    if (!this.statements() || this.statements().length === 0) {
      return [];
    }
    
    const basicProps: { label: string; value: string }[] = [];
    
    // 基本信息组的属性
    const basicGroups = ['基本信息', '概况', '基础属性'];
    
    this.statements().forEach((statement: any) => {
      if (statement.mainsnak?.label && statement.mainsnak?.group) {
        // 检查是否属于基本信息组
        if (basicGroups.includes(statement.mainsnak.group)) {
          const value = this.formatPropertyValue(statement);
          if (value) {
            basicProps.push({
              label: statement.mainsnak.label,
              value: value
            });
          }
        }
      }
    });
    
    return basicProps;
  }

  // 获取“图像”属性（只取第一个）
  public getImageProperty(): { label: string; value: string } | null {
    const allProps = [
      ...this.getBasicProperties(),
      ...this.getTechnicalProperties(),
      ...(this.statements() || []).map((statement: any) => ({
        label: statement.mainsnak?.label,
        value: this.formatPropertyValue(statement)
      }))
    ];
    const imgProp = allProps.find(prop => prop.label === '图像' && prop.value);
    return imgProp || null;
  }

  // 获取图片URL（支持直接URL或文件名）
  public getImageUrl(val: string): string {
    if (!val) return '';
    if (/^https?:\/\//.test(val)) return val;
    return `http://localhost:9000/kgms/${val}`;
  }

  getTechnicalProperties(): { label: string; value: string }[] {
    if (!this.statements() || this.statements().length === 0) {
      return [];
    }
    
    const techProps: { label: string; value: string }[] = [];
    
    // 技术信息组的属性
    const techGroups = ['技术参数', '技术数据', '规格参数', '性能参数'];
    
    this.statements().forEach((statement: any) => {
      if (statement.mainsnak?.label && statement.mainsnak?.group) {
        // 检查是否属于技术信息组
        if (techGroups.includes(statement.mainsnak.group)) {
          const value = this.formatPropertyValue(statement);
          if (value) {
            techProps.push({
              label: statement.mainsnak.label,
              value: value
            });
          }
        }
      }
    });
    
    return techProps;
  }

  // 修改访问修饰符为 public
  public formatPropertyValue(statement: any): string {
    if (!statement.mainsnak?.datavalue?.value) {
      return '';
    }

    const datavalue = statement.mainsnak.datavalue;
    const datatype = statement.mainsnak.datatype;

    switch (datatype) {
      case 'string':
      case 'external-id':
      case 'url':
        return datavalue.value.toString();
      
      case 'wikibase-item':
        return datavalue.value.label || datavalue.value.id || '';
      
      case 'quantity':
        const amount = datavalue.value.amount;
        const unit = datavalue.value.unit;
        return unit && unit !== '1' ? `${amount} ${unit}` : amount.toString();
      
      case 'time':
        // 处理wikidata时间格式
        const time = datavalue.value.time;
        if (typeof time === 'string' && time.startsWith('+')) {
          // 例：+2023-00-00T00:00:00Z
          const match = /^\+(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?T/.exec(time);
          if (match) {
            const year = match[1];
            const month = match[2];
            const day = match[3];
            if (day && day !== '00') {
              return `${year}-${month || '01'}-${day}日`;
            } else if (month && month !== '00') {
              return `${year}-${month}月`;
            } else {
              return `${year}年`;
            }
          }
        }
        // 兼容直接存储的字符串
        if (typeof time === 'string' && time.length > 0) {
          // 自动识别单位
          const t = time.replace(/^(\+)?/, '').replace(/T.*$/, '');
          if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}日`;
          if (/^\d{4}-\d{2}$/.test(t)) return `${t}月`;
          if (/^\d{4}$/.test(t)) return `${t}年`;
          return t;
        }
        return '';
      
      case 'globe-coordinate':
        const lat = datavalue.value.latitude;
        const lon = datavalue.value.longitude;
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      
      case 'monolingualtext':
        return datavalue.value.text || datavalue.value.toString();
      
      case 'commonsMedia':
        return datavalue.value.toString();
      
      default:
        return datavalue.value.toString();
    }
  }
}
