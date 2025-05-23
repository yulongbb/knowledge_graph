import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XAvatarModule, XButtonModule, XCheckboxModule, XDropdownModule, XInputModule, XLinkModule, XMenuModule, XRadioModule, XTagModule, XTextareaModule, XTimelineModule } from '@ng-nest/ui';
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
import { HomeComponent } from './home.component';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ShareModule,
    XLayoutModule,
    XDrawerModule,
    XButtonModule,
    XRadioModule,
    XDropdownModule,
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
        component: HomeComponent,
      },
    ]),
  ],
  exports: [RouterModule],
  providers: [EsService]

})
export class HomeModule {

}