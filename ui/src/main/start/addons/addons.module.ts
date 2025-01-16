import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { AddonsComponent } from './addons.component';
// Angular Material 模块
import { MatSidenavModule } from '@angular/material/sidenav'; // 侧边栏
import { MatListModule } from '@angular/material/list'; // 列表
import { MatCardModule } from '@angular/material/card'; // 卡片
import { MatIconModule } from '@angular/material/icon'; // 图标
import { MatToolbarModule } from '@angular/material/toolbar'; // 工具栏
import { MatGridListModule } from '@angular/material/grid-list'; // 网格布局


@NgModule({
  declarations: [AddonsComponent],
  imports: [
    CommonModule,
    ShareModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatGridListModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddonsComponent,
      },
    ]),
  ],
  exports: [RouterModule],
  providers: []

})
export class addonsModule {

}