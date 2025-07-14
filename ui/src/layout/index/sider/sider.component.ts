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
  get option() {
    return this.indexService.sideMenus;
  }

  // 输出参数-节点点击
  nodeEmit = new EventEmitter<object>();

  // 层级
  level: number = 0;

  constructor(private indexService: IndexService) {}

  ngOnInit() {
    // 监听一级菜单变化
    this.indexService.menuChange.subscribe(() => {
      // 菜单变化时，这里可以添加其他逻辑
    });
  }
}
