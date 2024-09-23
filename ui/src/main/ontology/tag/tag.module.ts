import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagComponent } from './tag.component';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { XButtonModule, XInputModule, XTreeModule } from '@ng-nest/ui';
import { NgxEchartsModule } from 'ngx-echarts';
import { XListModule } from '@ng-nest/ui/list';
import { XTableModule } from '@ng-nest/ui/table';
import { XCardModule } from '@ng-nest/ui/card';
import { XCrumbModule } from '@ng-nest/ui/crumb';
import { XTagModule } from '@ng-nest/ui/tag';
import { TagRoutesModule } from './tag-routes.module';
import { TagDetailComponent } from './tag-detail/tag-detail.component';





@NgModule({
  declarations: [TagComponent, TagDetailComponent],
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
    TagRoutesModule
  ],
  exports: [RouterModule],
  providers: []
})
export class TagModule {}