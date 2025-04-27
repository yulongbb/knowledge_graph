import { Component, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { IndexService } from '../index.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SiderComponent implements OnInit {
  // 输入参数-菜单数据
  option: any = _.filter(this.indexService.menus, (x) => x.pid === null);

  // 输出参数-节点点击
  nodeEmit = new EventEmitter<object>();

  // 层级
  level: number = 0;
  
  // 是否展开
  isExpanded = true;

  constructor(private indexService: IndexService) {}

  ngOnInit() {
    this.setupInitialState();
  }
  
  /**
   * 设置初始状态
   */
  setupInitialState() {
    // 检查本地存储的状态
    const savedState = localStorage.getItem('siderExpanded');
    if (savedState !== null) {
      this.isExpanded = savedState === 'true';
    }
  }
  
  /**
   * 切换侧边栏状态
   */
  toggleSider() {
    this.isExpanded = !this.isExpanded;
    localStorage.setItem('siderExpanded', String(this.isExpanded));
  }
}
