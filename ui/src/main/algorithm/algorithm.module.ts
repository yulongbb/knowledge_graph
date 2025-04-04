import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShareModule } from 'src/share/share.module';
import { NgNestModule } from 'src/share/ng-nest.module';
import { AuToolModule } from 'src/share/tool/tool.module';
import { AuAdaptionModule } from 'src/share/adaption/adaption.module';
import { XAutoCompleteModule, XButtonModule, XCheckboxModule, XDialogModule, XInputModule, XSliderModule, XTextareaModule, XTreeModule, XUploadModule } from '@ng-nest/ui';
import { NgxEchartsModule } from 'ngx-echarts';
import { XListModule } from '@ng-nest/ui/list';
import { XTableModule } from '@ng-nest/ui/table';
import { XCardModule } from '@ng-nest/ui/card';
import { XCrumbModule } from '@ng-nest/ui/crumb';
import { XTagModule } from '@ng-nest/ui/tag';
import { XMessageBoxService } from '@ng-nest/ui/message-box';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { AlgorithmComponent } from './algorithm.component';






@NgModule({
  declarations: [AlgorithmComponent ],
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
    XDialogModule,
    XUploadModule,
    XCheckboxModule,
    XButtonModule,
    XTextareaModule,
    XAutoCompleteModule,
    LeafletModule,
    XSliderModule,

    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    RouterModule.forChild([
      {
        path: '',
        component: AlgorithmComponent,
      },
    ]),
  ],
  exports: [RouterModule],
  providers: [XMessageBoxService]
})
export class AlgorithmModule {}