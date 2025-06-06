import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XAvatarModule, XButtonModule, XCheckboxModule, XInputModule, XLinkModule, XMenuModule, XRadioModule, XTagModule, XTextareaModule, XTimelineModule } from '@ng-nest/ui';
import { ShareModule } from 'src/share/share.module';
import { XSliderModule } from '@ng-nest/ui/slider';
import { XLayoutModule } from '@ng-nest/ui/layout';
import { XCardModule } from '@ng-nest/ui/card';
import { EsService } from './es.service';
import { XTextRetractModule } from '@ng-nest/ui/text-retract';
import { NgxMasonryModule } from 'ngx-masonry';
import { XPageHeaderModule } from '@ng-nest/ui/page-header';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { XStatisticModule } from '@ng-nest/ui/statistic';
import { XSelectModule } from '@ng-nest/ui/select';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EntityDetailComponent } from 'src/share/entity/entity-detail.component';
import { VideoDialogComponent } from './video-dialog/video-dialog.component';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [VideoComponent, VideoDialogComponent],
  imports: [
    CommonModule,
    ShareModule,
    XLayoutModule,
    XDrawerModule,
    XButtonModule,
    XRadioModule,
    XInputModule,
    XTextareaModule,
    XMenuModule,
    XSliderModule,
    XCardModule,
    XTextRetractModule,
    NgxMasonryModule,
    XPageHeaderModule,
    XTimelineModule,
    XAvatarModule,
    XStatisticModule,
    XSelectModule,
    XCheckboxModule,
    XTagModule,
    XLinkModule,
    LeafletModule,
    FontAwesomeModule,
    InfiniteScrollDirective,
    MatIconModule,

    RouterModule.forChild([
      {
        path: '',
        component: VideoComponent,
      },
      { path: ':type', component: EntityDetailComponent },
      { path: ':type/:id', component: EntityDetailComponent },
    ]),
  ],
  exports: [RouterModule],
  providers: [EsService]

})
export class VideoModule {

}