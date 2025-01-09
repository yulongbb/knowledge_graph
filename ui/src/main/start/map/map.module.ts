import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
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


@NgModule({
  declarations: [MapComponent],
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
    RouterModule.forChild([
      {
        path: '',
        component: MapComponent,
      },
      { path: ':type', component: EntityDetailComponent },
      { path: ':type/:id', component: EntityDetailComponent },
    ]),
  ],
  exports: [RouterModule],
  providers: [EsService]

})
export class MapModule {

}