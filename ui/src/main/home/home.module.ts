import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XButtonModule, XInputModule, XRadioModule, XTagModule, XTextRetractModule } from '@ng-nest/ui';
import { ShareModule } from 'src/share/share.module';
import { XSliderModule } from '@ng-nest/ui/slider';
import { XLayoutModule } from '@ng-nest/ui/layout';
import { XCardModule } from '@ng-nest/ui/card';

import { XMenuModule } from '@ng-nest/ui/menu';

import { NgxMasonryModule } from 'ngx-masonry';




@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ShareModule,
    XLayoutModule,
    XDrawerModule,
    XButtonModule,
    XRadioModule,
    XInputModule,
    XSliderModule,
    XCardModule,
    XTagModule,
    XMenuModule,
    NgxMasonryModule,
    XTextRetractModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
  ],
  exports: [RouterModule],

})
export class HomeModule {}