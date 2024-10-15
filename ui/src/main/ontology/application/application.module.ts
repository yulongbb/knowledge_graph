import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationComponent } from './application.component';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { XButtonModule, XInputModule, XTagModule, XTreeModule } from '@ng-nest/ui';
import { NgxEchartsModule } from 'ngx-echarts';
import { XListModule } from '@ng-nest/ui/list';
import { XTableModule } from '@ng-nest/ui/table';
import { XCardModule } from '@ng-nest/ui/card';
import { XCrumbModule } from '@ng-nest/ui/crumb';
import { ApplicationRoutesModule } from './application-routes.module';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';





@NgModule({
  declarations: [ApplicationComponent, ApplicationDetailComponent],
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
    XButtonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    ApplicationRoutesModule
  ],
  exports: [RouterModule],
  providers: []
})
export class ApplicationModule {}