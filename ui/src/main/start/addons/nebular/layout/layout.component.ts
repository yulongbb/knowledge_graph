import { Component, OnInit, HostListener, Renderer2, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NbMenuItem, NbIconConfig, NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nebular-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {
  menuItems: NbMenuItem[] = [
    {
      title: '端',
      icon: 'layers-outline',
      children: [
        { title: '数据接入', link: '/duan/access' },
        { title: '数据采集', link: '/duan/collect' },
        { title: '数据预处理', link: '/duan/preprocess' },
        { title: '数据清洗', link: '/duan/clean' }
      ],
      expanded: false
    },
    {
      title: '汇',
      icon: 'shuffle-2-outline',
      children: [
        { title: '数据汇聚', link: '/hui/converge' },
        { title: '数据整合', link: '/hui/integrate' },
        { title: '数据转换', link: '/hui/transform' },
        { title: '数据存储', link: '/hui/storage' }
      ],
      expanded: false
    },
    {
      title: '融',
      icon: 'flip-2-outline',
      children: [
        { title: '数据融合', link: '/rong/fusion' },
        { title: '知识建模', link: '/rong/modeling' },
        { title: '知识推理', link: '/rong/reasoning' },
        { title: '知识挖掘', link: '/rong/mining' }
      ],
      expanded: false
    },
    {
      title: '管',
      icon: 'grid-outline',
      children: [
        { title: '数据管理', link: '/guan/management' },
        { title: '质量管理', link: '/guan/quality' }
      ],
      expanded: false
    },
    {
      title: '控',
      icon: 'shield-outline',
      children: [
        { title: '访问控制', link: '/kong/access' },
        { title: '安全审计', link: '/kong/audit' }
      ],
      expanded: false
    },
    {
      title: '用',
      icon: 'share-outline',
      children: [
        { title: '数据服务', link: '/yong/service' },
        { title: '数据应用', link: '/yong/application' }
      ],
      expanded: false
    }
  ];

  sidebarMenu: NbMenuItem[] = [
    {
      title: '控制台',
      icon: 'home-outline',
      url: 'https://example.com/dashboard',
      target: '_blank'
    },
    {
      title: '数据中心',
      icon: 'layers-outline',
      children: [
        { title: '数据源管理', url: 'https://example.com/data/sources', target: '_blank' },
        { title: '数据资产', url: 'https://example.com/data/assets', target: '_blank' }
      ]
    },
    {
      title: '图谱分析',
      icon: 'activity-outline',
      children: [
        { title: '实体关系', url: 'https://example.com/analysis/entities', target: '_blank' },
        { title: '综合分析', url: 'https://example.com/analysis/comprehensive', target: '_blank' }
      ]
    },
    {
      title: '知识管理',
      icon: 'book-outline',
      children: [
        { title: '本体管理', link: '/knowledge/ontology' },
        { title: '知识库', link: '/knowledge/base' }
      ]
    },
    {
      title: '系统设置',
      icon: 'settings-outline',
      children: [
        { title: '用户管理', link: '/settings/users' },
        { title: '权限配置', link: '/settings/permissions' },
        { title: '系统配置', link: '/settings/system' }
      ]
    }
  ];

  user = {
    name: '管理员',
    picture: 'assets/images/user.png',
    title: '系统管理员'
  };

  userMenu = [
    { title: '个人信息', icon: 'person-outline' },
    { title: '退出登录', icon: 'power-outline' }
  ];

  currentYear = new Date().getFullYear();
  isSettingsOpen = false;
  isMobileNavigation = false;

  currentTime = new Date().toLocaleTimeString();
  currentPage = 0;

  @ViewChild('pagesContainer') pagesContainer: ElementRef | undefined;

  private gradients = [
    'linear-gradient(135deg, #FF9B9B, #FF5E5E)',
    'linear-gradient(135deg, #9BC3FF, #5E8FFF)',
    'linear-gradient(135deg, #9BFFC3, #5EFFAE)',
    'linear-gradient(135deg, #E9FF9B, #D6FF5E)',
    'linear-gradient(135deg, #DC9BFF, #BE5EFF)',
    'linear-gradient(135deg, #FFC29B, #FFA05E)',
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router
  ) {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000);
  }

  ngOnInit() {
    setTimeout(() => {
      this.sidebarService.expand('left');
    }, 0);
  }

  ngAfterViewInit() {
    if (this.pagesContainer) {
      this.setupScrollListener();
    }
  }

  setupScrollListener() {
    if (this.pagesContainer) {
      const container = this.pagesContainer.nativeElement;
      container.addEventListener('scroll', () => {
        const pageWidth = container.offsetWidth;
        const scrollPosition = container.scrollLeft;
        this.currentPage = Math.round(scrollPosition / pageWidth);
      });
    }
  }

  scrollToPage(index: number) {
    if (this.pagesContainer) {
      const container = this.pagesContainer.nativeElement;
      const pageWidth = container.offsetWidth;
      container.scrollTo({
        left: pageWidth * index,
        behavior: 'smooth'
      });
    }
  }

  toggleMenu(item: NbMenuItem): void {
    item.expanded = !item.expanded;
    this.menuItems.forEach(menu => {
      if (menu !== item) {
        menu.expanded = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarService.toggle(true, 'left');
  }

  toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  closeSettings(event: Event): void {
    event.stopPropagation();
    this.isSettingsOpen = false;
  }

  onOverlayClick(event: Event): void {
    const target = event.target as HTMLElement;
    console.log('Overlay clicked:', target);
    if (target.classList.contains('settings-overlay')) {
      this.toggleSettings();
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('settings-overlay')) {
      this.toggleSettings();
    }
  }

  getIconName(icon: string | NbIconConfig | undefined): string {
    if (typeof icon === 'string') {
      return icon;
    } else if (icon && typeof icon === 'object') {
      return icon.icon || '';
    }
    return '';
  }

  openSettingsDialog(): void {
    this.isSettingsOpen = true;
  }

  closeSettingsDialog(): void {
    this.isSettingsOpen = false;
  }

  openAssistant(): void {
    console.log('Intelligent Assistant activated!');
  }

  toggleMobileNavigation(): void {
    console.log('Mobile Navigation Mode:', this.isMobileNavigation);
    if (this.isMobileNavigation) {
      console.log('Mobile navigation enabled');
    } else {
      console.log('Mobile navigation disabled');
    }
  }

  navigateHome(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Checks if the provided link is an external URL
   */
  isExternalLink(link: string | undefined): boolean {
    if (!link) return false;
    return link.startsWith('http://') || link.startsWith('https://');
  }

  /**
   * Handles navigation based on link type (internal or external)
   */
  navigateTo(link: string | undefined): void {
    if (!link) {
      console.warn('Navigation link is undefined.');
      return;
    }
    
    console.log('Navigating to:', link);
    
    if (this.isExternalLink(link)) {
      // Open external links in new window
      window.open(link, '_blank');
    } else {
      // Navigate internally with Angular router
      this.router.navigate([link]);
    }
  }

  /**
   * Alternative navigation method that accepts the Nebular menu event object
   * which contains the menu item in its structure
   */
  navigateToMenuItem(event: any): void {
    if (!event || !event.item) {
      console.warn('Invalid menu event or no item in event');
      return;
    }
    
    const item = event.item;
    const destination = item.url || item.link;
    if (!destination) {
      console.warn('Navigation destination is undefined.');
      return;
    }
    
    console.log('Navigating to menu item:', destination);
    
    if (item.url) {
      // External URL - open in new window/tab if target is specified
      window.open(destination, item.target || '_self');
    } else if (item.link) {
      // Internal link - use Angular router
      this.router.navigate([destination]);
    }
  }

  getRandomGradient(): string {
    return this.gradients[Math.floor(Math.random() * this.gradients.length)];
  }
}
