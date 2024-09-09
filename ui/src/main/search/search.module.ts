import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XAvatarModule, XButtonModule, XInputModule, XMenuModule, XRadioModule, XTimelineModule } from '@ng-nest/ui';
import { ShareModule } from 'src/share/share.module';
import { XSliderModule } from '@ng-nest/ui/slider';
import { XLayoutModule } from '@ng-nest/ui/layout';
import { XCardModule } from '@ng-nest/ui/card';
import { EsService } from './es.service';
import { SearchDetailComponent } from './search-detail/search-detail.component';
import { XTextRetractModule } from '@ng-nest/ui/text-retract';
import { NgxMasonryModule } from 'ngx-masonry';
import { XPageHeaderModule } from '@ng-nest/ui/page-header';



@NgModule({
  declarations: [SearchComponent, SearchDetailComponent],
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
    RouterModule.forChild([
      {
        path: '',
        component: SearchComponent,
      },
      { path: ':type', component: SearchDetailComponent },
      { path: ':type/:id', component: SearchDetailComponent }
    ]),
  ],
  exports: [RouterModule],
  providers: [EsService]

})
export class SearchModule {}