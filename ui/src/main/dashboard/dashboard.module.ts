import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { XInputModule, XTreeModule } from '@ng-nest/ui';
import { NgxEchartsModule } from 'ngx-echarts';
import { XListModule } from '@ng-nest/ui/list';
import { DashboardService } from './dashboard.service';
import { XTableModule } from '@ng-nest/ui/table';
import { XCardModule } from '@ng-nest/ui/card';
import { XCrumbModule } from '@ng-nest/ui/crumb';
import { XTagModule } from '@ng-nest/ui/tag';





@NgModule({
  declarations: [DashboardComponent, ],
  imports: [
    CommonModule,
    ShareModule,
    NgNestModule,
    AuToolModule,
    AuAdaptionModule,
    XTreeModule,
    XInputModule,
    XListModule,
    XTableModule,
    XCardModule,
    XCrumbModule,
    XTagModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
  ],
  exports: [RouterModule],
  providers: [DashboardService]
})
export class DashboardModule {}