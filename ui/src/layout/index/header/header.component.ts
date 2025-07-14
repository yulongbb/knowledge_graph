import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  settingVisible = false;
  settingDark: XBoolean = false;
  settingForm = new UntypedFormGroup({});
  settingControls: XControl[] = [
    { id: 'primary', control: 'color-picker', label: '主色' },
    { id: 'dark', control: 'switch', label: '暗黑模式' }
  ];

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
  }

  /**
   * 顶部菜单点击事件
   */
  onTopMenuClick(menu: any) {
    this.indexService.setActiveTopMenu(menu);
    // 如果一级菜单有直接路由，则跳转
    if (menu.router && menu.router !== '$') {
      this.router.navigate([`/index/${menu.router}`]);
    }
  }

  /**
   * 退出
   */
  logout() {
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
