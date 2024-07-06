import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { RouterModule } from '@angular/router';
import { XDrawerModule } from '@ng-nest/ui/drawer';
import { XButtonModule, XInputModule, XRadioModule } from '@ng-nest/ui';
import { ShareModule } from 'src/share/share.module';
import { XSliderModule } from '@ng-nest/ui/slider';
import { XLayoutModule } from '@ng-nest/ui/layout';
import { XCardModule } from '@ng-nest/ui/card';





@NgModule({
  declarations: [SearchComponent],
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
    RouterModule.forChild([
      {
        path: '',
        component: SearchComponent,
      },
    ]),
  ],
  exports: [RouterModule],

})
export class SearchModule {}