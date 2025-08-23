import { Component, OnInit, ViewEncapsulation, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { IndexService } from '../index.service';
import { NavService } from './../../../services/nav.service';
import { ConfigService } from 'src/services/config.service';
import { UntypedFormGroup } from '@angular/forms';
import { XControl } from '@ng-nest/ui/form';
import { XColorsTheme, XBoolean } from '@ng-nest/ui/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, AfterViewInit {
  settingVisible = false;
  userDropdownVisible = false;
  settingDark: XBoolean = false;
  settingForm = new UntypedFormGroup({});
  settingControls: XControl[] = [
    { id: 'primary', control: 'color-picker', label: '主色' },
    { id: 'dark', control: 'switch', label: '暗黑模式' }
  ];

  @ViewChild('topNav', { static: false }) topNavRef!: ElementRef;
  @ViewChild('header', { static: false }) headerRef!: ElementRef;

  visibleMenus: any[] = [];
  overflowMenus: any[] = [];
  moreMenuVisible = false;

  constructor(
    public auth: AuthService,
    public indexService: IndexService,
    public router: Router,
    public location: Location,
    public nav: NavService,
    private config: ConfigService
  ) {}

  ngOnInit() {
    // 初始化时设置默认的一级菜单
    const topMenus = this.indexService.topMenus;
    if (topMenus.length > 0 && !this.indexService.activeTopMenu) {
      this.indexService.setActiveTopMenu(topMenus[0]);
    }
    this.settingDark = this.config.dark;

    setTimeout(() => this.updateMenus(), 0);
    window.addEventListener('resize', this.updateMenus.bind(this));
  }

  ngAfterViewInit() {
    setTimeout(() => this.updateMenus(), 0);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateMenus.bind(this));
  }

  updateMenus() {
    const menus = this.indexService.topMenus || [];
    // 默认显示前5个菜单
    this.visibleMenus = menus.slice(0, 5);
    this.overflowMenus = menus.slice(5);
  }

  // 监听全局点击事件，关闭下拉菜单
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.user-dropdown');
    if (!dropdown && this.userDropdownVisible) {
      this.userDropdownVisible = false;
    }
    if (this.moreMenuVisible) {
      this.moreMenuVisible = false;
    }
  }

  /**
   * 顶部菜单点击事件
   */
  onTopMenuClick(menu: any) {
    this.indexService.setActiveTopMenu(menu);
    
    // 获取当前一级菜单的子菜单
    const subMenus = this.indexService.menus.filter(m => m.pid === menu.id);
    
    if (subMenus.length > 0) {
      // 如果有子菜单，跳转到第一个子菜单
      const firstSubMenu = subMenus[0];
      if (firstSubMenu.router && firstSubMenu.router !== '$') {
        this.router.navigate([`/index/${firstSubMenu.router}`]);
      }
    } else {
      // 如果没有子菜单且一级菜单有直接路由，则跳转到一级菜单
      if (menu.router && menu.router !== '$') {
        this.router.navigate([`/index/${menu.router}`]);
      }
    }
    this.moreMenuVisible = false;
  }

  /**
   * 切换用户下拉菜单
   */
  toggleUserDropdown() {
    this.userDropdownVisible = !this.userDropdownVisible;
  }

  toggleMoreMenu(event: MouseEvent) {
    event.stopPropagation();
    this.moreMenuVisible = !this.moreMenuVisible;
  }

  onMoreMenuClick(menu: any) {
    // 替换主菜单最后一个为当前选中的更多菜单
    if (this.visibleMenus.length > 0) {
      // 找到当前菜单在overflowMenus中的索引
      const idx = this.overflowMenus.findIndex(m => m.id === menu.id);
      if (idx !== -1) {
        // 移出主菜单最后一个
        const movedOut = this.visibleMenus.pop();
        // 移入当前选中的更多菜单
        this.visibleMenus.push(menu);
        // overflowMenus替换为移出的菜单
        this.overflowMenus.splice(idx, 1, movedOut);
      }
    }
    this.indexService.setActiveTopMenu(menu);
    // 跳转逻辑
    const subMenus = this.indexService.menus.filter(m => m.pid === menu.id);
    if (subMenus.length > 0) {
      const firstSubMenu = subMenus[0];
      if (firstSubMenu.router && firstSubMenu.router !== '$') {
        this.router.navigate([`/index/${firstSubMenu.router}`]);
      }
    } else {
      if (menu.router && menu.router !== '$') {
        this.router.navigate([`/index/${menu.router}`]);
      }
    }
    this.moreMenuVisible = false;
  }

  /**
   * 退出
   */
  logout() {
    this.userDropdownVisible = false;
    this.auth.logout().subscribe((x) => {
      if (x) {
        this.indexService.removeSession();
        this.indexService.session = { tabsPage: [] };
        this.nav.destroy();
        this.config.deleteRouteSnapshot();
        this.config.deleteRouteSnapshot(this.location.path());
        this.router.navigate(['/login']);
      }
    });
  }

  defaultClick(_theme: XColorsTheme) {
    this.config.dark = false;
  }

  darkChange(dark: XBoolean) {
    this.config.dark = dark as boolean;
  }

  action(type: string) {
    switch (type) {
      case 'logout':
        this.logout();
        break;
    }
  }
}