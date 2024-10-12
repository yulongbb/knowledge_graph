import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeaponComponent } from './weapon.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XAvatarModule, XButtonModule, XCheckboxModule, XInputModule, XLinkModule, XMenuModule, XRadioModule, XTagModule, XTimelineModule } from '@ng-nest/ui';
import { ShareModule } from 'src/share/share.module';
import { XSliderModule } from '@ng-nest/ui/slider';
import { XLayoutModule } from '@ng-nest/ui/layout';
import { XCardModule } from '@ng-nest/ui/card';
import { EsService } from './es.service';
import { WeaponDetailComponent } from './weapon-detail/weapon-detail.component';
import { XTextRetractModule } from '@ng-nest/ui/text-retract';
import { NgxMasonryModule } from 'ngx-masonry';
import { XPageHeaderModule } from '@ng-nest/ui/page-header';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { XStatisticModule } from '@ng-nest/ui/statistic';
import { XSelectModule } from '@ng-nest/ui/select';

@NgModule({
  declarations: [WeaponComponent, WeaponDetailComponent],
  imports: [
    CommonModule,
    ShareModule,
    XLayoutModule,
    XDrawerModule,
    XButtonModule,
    XRadioModule,
    XInputModule,
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
    InfiniteScrollDirective,
    RouterModule.forChild([
      {
        path: '',
        component: WeaponComponent,
      },
      { path: ':type', component: WeaponDetailComponent },
      { path: ':type/:id', component: WeaponDetailComponent }
    ]),
  ],
  exports: [RouterModule],
  providers: [EsService]

})
export class WeaponModule {}