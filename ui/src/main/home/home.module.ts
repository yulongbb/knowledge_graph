import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XButtonModule, XInputModule, XRadioModule, XTagModule } from '@ng-nest/ui';
import { ShareModule } from 'src/share/share.module';
import { XSliderModule } from '@ng-nest/ui/slider';
import { XLayoutModule } from '@ng-nest/ui/layout';
import { XCardModule } from '@ng-nest/ui/card';





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