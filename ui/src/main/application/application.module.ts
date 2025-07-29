import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationComponent } from './application.component';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { 
  XButtonModule, 
  XInputModule, 
  XTagModule, 
  XTreeModule, 
  XSelectModule,
  XLinkModule,
  XIconModule,
  XMessageModule,
  XFormModule
} from '@ng-nest/ui';
import { NgxEchartsModule } from 'ngx-echarts';
import { XListModule } from '@ng-nest/ui/list';
import { XTableModule } from '@ng-nest/ui/table';
import { XCardModule } from '@ng-nest/ui/card';
import { XCrumbModule } from '@ng-nest/ui/crumb';
import { ApplicationRoutesModule } from './application-routes.module';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonPipeModule } from 'src/share/pipe/pipe.module';
import { NamespaceService } from 'src/main/ontology/ontology/namespace/namespace.service';

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
    XSelectModule, // 确保 XSelectModule 已导入
    XLinkModule,
    XIconModule,
    XMessageModule,
    XFormModule,
    FormsModule,
    ReactiveFormsModule,
    CommonPipeModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    ApplicationRoutesModule
  ],
  exports: [RouterModule],
  providers: [NamespaceService] // 确保 NamespaceService 已注册
})
export class ApplicationModule {}